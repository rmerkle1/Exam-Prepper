const express = require('express');
const { getDb } = require('../db');
const { adminMiddleware } = require('../middleware/auth');
const { calculateSeasonPoints, recalculateForYear } = require('../utils/scoring');
const { scrapeDraft, scrapePerGameStats, scrapeAwards, scrapeAllStars } = require('../utils/bballref');

const router = express.Router();
router.use(adminMiddleware);

// ── Draft sync ─────────────────────────────────────────────────────────────────
// Scrapes /draft/NBA_{year}.html and upserts players into the DB.
// Matches existing players by bball_ref_id first, then by name (case-insensitive).
router.post('/draft/:year', async (req, res) => {
  const year = parseInt(req.params.year);
  const log = [];

  try {
    const picks = await scrapeDraft(year);
    log.push(`Scraped ${picks.length} picks from Basketball Reference`);

    const db = getDb();

    // Ensure draft class exists
    const dc = db.prepare('SELECT id FROM draft_classes WHERE year = ?').get(year);
    if (!dc) {
      db.prepare('INSERT OR IGNORE INTO draft_classes (year, lock_date) VALUES (?, ?)').run(year, `${year + 1}-10-01`);
      log.push(`Created draft class ${year} with placeholder lock date`);
    }

    let inserted = 0, updated = 0, skipped = 0;

    for (const pick of picks) {
      // 1. Try to find by bball_ref_id
      let existing = pick.bball_ref_id
        ? db.prepare('SELECT id FROM players WHERE bball_ref_id = ?').get(pick.bball_ref_id)
        : null;

      // 2. Fall back to name match within draft year
      if (!existing) {
        existing = db.prepare(
          'SELECT id FROM players WHERE draft_year = ? AND LOWER(name) = LOWER(?)'
        ).get(year, pick.name);
      }

      if (existing) {
        db.prepare(`
          UPDATE players SET bball_ref_id = ?, draft_pick = ?, draft_team = ?, draft_year = ?
          WHERE id = ?
        `).run(pick.bball_ref_id, pick.draft_pick, pick.draft_team, year, existing.id);
        updated++;
      } else {
        db.prepare(`
          INSERT INTO players (name, draft_year, draft_pick, draft_team, bball_ref_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(pick.name, year, pick.draft_pick, pick.draft_team, pick.bball_ref_id);
        inserted++;
      }

      // Auto-link unmatched board entries by name
      if (pick.bball_ref_id) {
        const player = db.prepare('SELECT id FROM players WHERE bball_ref_id = ?').get(pick.bball_ref_id);
        if (player) {
          db.prepare(`
            UPDATE big_board_entries SET player_id = ?
            WHERE player_id IS NULL
              AND LOWER(player_name) = LOWER(?)
              AND big_board_id IN (SELECT id FROM big_boards WHERE draft_year = ?)
          `).run(player.id, pick.name, year);
        }
      }
    }

    log.push(`Players: ${inserted} inserted, ${updated} updated`);
    res.json({ ok: true, log, inserted, updated, total: picks.length });
  } catch (err) {
    res.status(500).json({ error: err.message, log });
  }
});

// ── Season stats + awards sync ─────────────────────────────────────────────────
// Scrapes per-game stats and awards for a season, updates player_season_scores
// for all players in the given draft class.
router.post('/season/:draftYear/:seasonYear', async (req, res) => {
  const draftYear = parseInt(req.params.draftYear);
  const seasonYear = parseInt(req.params.seasonYear);
  const { is_final = false } = req.body;
  const log = [];

  try {
    const db = getDb();

    // Get all players in this draft class that have a bball_ref_id
    const players = db.prepare(
      'SELECT id, name, bball_ref_id FROM players WHERE draft_year = ? AND bball_ref_id IS NOT NULL'
    ).all(draftYear);

    if (players.length === 0) {
      return res.status(400).json({ error: `No players with bball_ref_id found for ${draftYear} draft. Run draft sync first.` });
    }

    const refIdToPlayer = {};
    for (const p of players) refIdToPlayer[p.bball_ref_id] = p;

    log.push(`Found ${players.length} players with bball_ref_id in ${draftYear} class`);

    // Scrape per-game stats
    log.push(`Fetching per-game stats for ${seasonYear} season...`);
    const statsMap = await scrapePerGameStats(seasonYear);
    log.push(`Scraped stats for ${Object.keys(statsMap).length} players league-wide`);

    // Scrape awards (adds another HTTP request)
    log.push(`Fetching awards for ${seasonYear}...`);
    const awards = await scrapeAwards(seasonYear);
    log.push(`Awards: MVP=${awards.mvp ?? 'none'}, ROY=${awards.roy ?? 'none'}, 6MOY=${awards.sixth_man ?? 'none'}, All-NBA=${awards.all_nba.length}, All-D=${awards.all_defense.length}, All-Rookie=${awards.all_rookie.length}`);

    // Scrape All-Stars
    log.push(`Fetching All-Star selections for ${seasonYear}...`);
    const allStars = await scrapeAllStars(seasonYear);
    log.push(`All-Stars found: ${allStars.length}`);

    // Build sets for O(1) lookup
    const allNbaSet = new Set(awards.all_nba);
    const allDefenseSet = new Set(awards.all_defense);
    const allRookieSet = new Set(awards.all_rookie);
    const allStarSet = new Set(allStars);

    const upsertScore = db.prepare(`
      INSERT INTO player_season_scores
        (player_id, season_year, games_played, games_started,
         is_allstar, is_allnba, is_mvp, is_alldefense, is_allrookie, is_roy, is_sixth_man,
         points_earned, is_final, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(player_id, season_year) DO UPDATE SET
        games_played = excluded.games_played,
        games_started = excluded.games_started,
        is_allstar = excluded.is_allstar,
        is_allnba = excluded.is_allnba,
        is_mvp = excluded.is_mvp,
        is_alldefense = excluded.is_alldefense,
        is_allrookie = excluded.is_allrookie,
        is_roy = excluded.is_roy,
        is_sixth_man = excluded.is_sixth_man,
        points_earned = excluded.points_earned,
        is_final = excluded.is_final,
        updated_at = excluded.updated_at
    `);

    let matched = 0, notFound = [];

    for (const player of players) {
      const stat = statsMap[player.bball_ref_id];

      // If player wasn't in the stats page, they didn't play (0 games)
      const gp = stat ? stat.games_played : 0;
      const gs = stat ? stat.games_started : 0;

      const scoreData = {
        games_played: gp,
        games_started: gs,
        is_allstar: allStarSet.has(player.bball_ref_id) ? 1 : 0,
        is_allnba: allNbaSet.has(player.bball_ref_id) ? 1 : 0,
        is_mvp: awards.mvp === player.bball_ref_id ? 1 : 0,
        is_alldefense: allDefenseSet.has(player.bball_ref_id) ? 1 : 0,
        is_allrookie: allRookieSet.has(player.bball_ref_id) ? 1 : 0,
        is_roy: awards.roy === player.bball_ref_id ? 1 : 0,
        is_sixth_man: awards.sixth_man === player.bball_ref_id ? 1 : 0,
      };

      const pts = calculateSeasonPoints(scoreData);

      upsertScore.run(
        player.id, seasonYear, gp, gs,
        scoreData.is_allstar, scoreData.is_allnba, scoreData.is_mvp,
        scoreData.is_alldefense, scoreData.is_allrookie, scoreData.is_roy, scoreData.is_sixth_man,
        pts, is_final ? 1 : 0
      );

      if (stat) {
        matched++;
        if (pts > 0) log.push(`  ${player.name}: ${gp}G/${gs}GS, ${pts}pts${scoreData.is_allstar ? ' AS' : ''}${scoreData.is_allnba ? ' AN' : ''}${scoreData.is_mvp ? ' MVP' : ''}${scoreData.is_roy ? ' ROY' : ''}${scoreData.is_allrookie ? ' AR' : ''}${scoreData.is_sixth_man ? ' 6M' : ''}${scoreData.is_alldefense ? ' AD' : ''}`);
      } else {
        notFound.push(player.name);
      }
    }

    log.push(`Matched ${matched}/${players.length} players to season stats`);
    if (notFound.length) log.push(`No stats found for: ${notFound.join(', ')}`);

    // Recalculate rankings and board scores
    log.push(`Recalculating rankings and board scores for ${draftYear}...`);
    const calcResult = recalculateForYear(draftYear);
    log.push(`Done: ${calcResult.players} players ranked, ${calcResult.boards} boards scored`);

    res.json({ ok: true, log, matched, total: players.length, not_found: notFound });
  } catch (err) {
    res.status(500).json({ error: err.message, log });
  }
});

// ── Preview: what would be scraped ────────────────────────────────────────────
// Scrapes draft without writing to DB — useful for verifying before committing
router.get('/draft/:year/preview', async (req, res) => {
  const year = parseInt(req.params.year);
  try {
    const picks = await scrapeDraft(year);
    res.json({ year, count: picks.length, picks: picks.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
