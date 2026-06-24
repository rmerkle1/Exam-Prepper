const express = require('express');
const { getDb } = require('../db');
const { adminMiddleware } = require('../middleware/auth');
const { calculateSeasonPoints, recalculateForYear } = require('../utils/scoring');

const router = express.Router();
router.use(adminMiddleware);

// Create/update draft class
router.post('/draft-classes', (req, res) => {
  const db = getDb();
  const { year, lock_date } = req.body;
  if (!year || !lock_date) return res.status(400).json({ error: 'year and lock_date required' });
  db.prepare(`
    INSERT INTO draft_classes (year, lock_date)
    VALUES (?, ?)
    ON CONFLICT(year) DO UPDATE SET lock_date = excluded.lock_date
  `).run(parseInt(year), lock_date);
  res.json({ ok: true });
});

// Lock/unlock a draft class
router.patch('/draft-classes/:year/lock', (req, res) => {
  const db = getDb();
  const { is_locked } = req.body;
  db.prepare('UPDATE draft_classes SET is_locked = ? WHERE year = ?').run(is_locked ? 1 : 0, parseInt(req.params.year));

  if (is_locked) {
    // Lock all boards for this year
    db.prepare('UPDATE big_boards SET is_locked = 1 WHERE draft_year = ?').run(parseInt(req.params.year));
  }

  res.json({ ok: true });
});

// Create/update player
router.post('/players', (req, res) => {
  const db = getDb();
  const { id, name, draft_year, draft_pick, draft_team, bball_ref_id, position } = req.body;
  if (!name || !draft_year) return res.status(400).json({ error: 'name and draft_year required' });

  if (id) {
    db.prepare(`
      UPDATE players SET name=?, draft_year=?, draft_pick=?, draft_team=?, bball_ref_id=?, position=?
      WHERE id=?
    `).run(name, parseInt(draft_year), draft_pick || null, draft_team || null, bball_ref_id || null, position || null, id);
    return res.json({ id, ok: true });
  }

  const result = db.prepare(`
    INSERT INTO players (name, draft_year, draft_pick, draft_team, bball_ref_id, position)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, parseInt(draft_year), draft_pick || null, draft_team || null, bball_ref_id || null, position || null);

  // Auto-link existing board entries by name
  db.prepare(`
    UPDATE big_board_entries SET player_id = ?
    WHERE player_id IS NULL AND LOWER(player_name) = LOWER(?) AND big_board_id IN (
      SELECT id FROM big_boards WHERE draft_year = ?
    )
  `).run(result.lastInsertRowid, name, parseInt(draft_year));

  res.status(201).json({ id: result.lastInsertRowid, ok: true });
});

// Delete player
router.delete('/players/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM player_season_scores WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM player_career_scores WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM true_value_rankings WHERE player_id = ?').run(req.params.id);
  db.prepare('UPDATE big_board_entries SET player_id = NULL WHERE player_id = ?').run(req.params.id);
  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Add or update season score for a player
router.post('/season-scores', (req, res) => {
  const db = getDb();
  const {
    player_id, season_year,
    games_played = 0, games_started = 0,
    is_allstar = 0, is_allnba = 0, is_mvp = 0,
    is_alldefense = 0, is_allrookie = 0, is_roy = 0, is_sixth_man = 0,
    is_final = 0,
  } = req.body;

  if (!player_id || !season_year) return res.status(400).json({ error: 'player_id and season_year required' });

  const scoreData = { games_played, games_started, is_allstar, is_allnba, is_mvp, is_alldefense, is_allrookie, is_roy, is_sixth_man };
  const points = calculateSeasonPoints(scoreData);

  db.prepare(`
    INSERT INTO player_season_scores
      (player_id, season_year, games_played, games_started, is_allstar, is_allnba, is_mvp,
       is_alldefense, is_allrookie, is_roy, is_sixth_man, points_earned, is_final, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(player_id, season_year) DO UPDATE SET
      games_played=excluded.games_played, games_started=excluded.games_started,
      is_allstar=excluded.is_allstar, is_allnba=excluded.is_allnba, is_mvp=excluded.is_mvp,
      is_alldefense=excluded.is_alldefense, is_allrookie=excluded.is_allrookie,
      is_roy=excluded.is_roy, is_sixth_man=excluded.is_sixth_man,
      points_earned=excluded.points_earned, is_final=excluded.is_final,
      updated_at=excluded.updated_at
  `).run(player_id, season_year, games_played, games_started,
    is_allstar ? 1 : 0, is_allnba ? 1 : 0, is_mvp ? 1 : 0,
    is_alldefense ? 1 : 0, is_allrookie ? 1 : 0, is_roy ? 1 : 0, is_sixth_man ? 1 : 0,
    points, is_final ? 1 : 0);

  res.json({ ok: true, points_earned: points });
});

// Delete a season score
router.delete('/season-scores/:playerId/:seasonYear', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM player_season_scores WHERE player_id = ? AND season_year = ?')
    .run(req.params.playerId, req.params.seasonYear);
  res.json({ ok: true });
});

// Recalculate all scores for a draft year
router.post('/recalculate/:year', (req, res) => {
  try {
    const result = recalculateForYear(parseInt(req.params.year));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Link a board entry to a player
router.patch('/board-entries/:id/link', (req, res) => {
  const db = getDb();
  const { player_id } = req.body;
  db.prepare('UPDATE big_board_entries SET player_id = ? WHERE id = ?').run(player_id || null, req.params.id);
  res.json({ ok: true });
});

// Delete a board (admin)
router.delete('/boards/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM big_board_entries WHERE big_board_id = ?').run(req.params.id);
  db.prepare('DELETE FROM board_scores WHERE big_board_id = ?').run(req.params.id);
  db.prepare('DELETE FROM big_boards WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// List all users
router.get('/users', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC').all());
});

// Promote/demote admin
router.patch('/users/:id/admin', (req, res) => {
  const db = getDb();
  const { is_admin } = req.body;
  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(is_admin ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
