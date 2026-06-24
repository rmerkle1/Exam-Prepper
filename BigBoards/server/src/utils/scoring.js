const { getDb } = require('../db');

function calculateSeasonPoints(score) {
  let points = 0;
  if (score.games_played >= 1) points += 1;
  if (score.games_played > 41) points += 2;
  if (score.games_started > 41) points += 3;
  if (score.is_allstar) points += 5;
  if (score.is_allnba) points += 7;
  if (score.is_mvp) points += 10;
  if (score.is_alldefense) points += 5;
  if (score.is_allrookie) points += 5;
  if (score.is_roy) points += 5;
  if (score.is_sixth_man) points += 5;
  return points;
}

function calculateBoardScores(entries, trueRankings) {
  const trueRankMap = {};
  for (const tr of trueRankings) {
    trueRankMap[tr.player_id] = tr.true_rank;
  }

  const validEntries = entries.filter(e => e.rank >= 1 && e.rank <= 60 && e.player_id && trueRankMap[e.player_id]);

  let allTotal = 0, allCount = 0;
  let firstTotal = 0, firstCount = 0;
  let secondTotal = 0, secondCount = 0;
  let weightedTotal = 0, weightSum = 0;

  for (const entry of validEntries) {
    const authorRank = entry.rank;
    const trueRank = trueRankMap[entry.player_id];
    const baseScore = Math.max(0, 1 - Math.abs(authorRank - trueRank) / 60);
    const weight = 1 + (60 - trueRank) / 60;

    allTotal += baseScore;
    allCount++;

    if (authorRank <= 30) {
      firstTotal += baseScore;
      firstCount++;
    } else {
      secondTotal += baseScore;
      secondCount++;
    }

    weightedTotal += baseScore * weight;
    weightSum += weight;
  }

  return {
    all_around_score: allCount > 0 ? allTotal / allCount : 0,
    first_round_score: firstCount > 0 ? firstTotal / firstCount : 0,
    second_round_score: secondCount > 0 ? secondTotal / secondCount : 0,
    weighted_score: weightSum > 0 ? weightedTotal / weightSum : 0,
  };
}

function buildConsensusRanking(allEntries) {
  // allEntries: [{player_name, player_id, rank}, ...]  from all boards
  const playerRanks = {};
  for (const e of allEntries) {
    if (!e.player_id || e.rank < 1 || e.rank > 60) continue;
    if (!playerRanks[e.player_id]) playerRanks[e.player_id] = [];
    playerRanks[e.player_id].push(e.rank);
  }

  const averages = Object.entries(playerRanks).map(([player_id, ranks]) => ({
    player_id: parseInt(player_id),
    avg_rank: ranks.reduce((a, b) => a + b, 0) / ranks.length,
  }));

  averages.sort((a, b) => a.avg_rank - b.avg_rank);
  return averages.map((p, i) => ({ player_id: p.player_id, consensus_rank: i + 1, avg_rank: p.avg_rank }));
}

function recalculateForYear(year) {
  const db = getDb();

  // 1. Recompute season points for all players in this draft year
  const players = db.prepare('SELECT id FROM players WHERE draft_year = ?').all(year);
  const updatePoints = db.prepare(
    `UPDATE player_season_scores SET points_earned = ?, updated_at = datetime('now') WHERE id = ?`
  );
  for (const player of players) {
    const seasons = db.prepare('SELECT * FROM player_season_scores WHERE player_id = ?').all(player.id);
    for (const s of seasons) {
      const pts = calculateSeasonPoints(s);
      updatePoints.run(pts, s.id);
    }
  }

  // 2. Recompute career totals
  const upsertCareer = db.prepare(`
    INSERT INTO player_career_scores (player_id, total_points, last_updated)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(player_id) DO UPDATE SET total_points = excluded.total_points, last_updated = excluded.last_updated
  `);
  for (const player of players) {
    const result = db.prepare(
      'SELECT COALESCE(SUM(points_earned), 0) as total FROM player_season_scores WHERE player_id = ?'
    ).get(player.id);
    upsertCareer.run(player.id, result.total);
  }

  // 3. Build true value rankings
  const careerScores = db.prepare(`
    SELECT p.id, p.name, COALESCE(pcs.total_points, 0) as total_points
    FROM players p
    LEFT JOIN player_career_scores pcs ON pcs.player_id = p.id
    WHERE p.draft_year = ?
    ORDER BY total_points DESC, p.id ASC
  `).all(year);

  db.prepare('DELETE FROM true_value_rankings WHERE draft_year = ?').run(year);
  const insertTvr = db.prepare(`
    INSERT INTO true_value_rankings (draft_year, player_id, true_rank, career_points, calculated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  for (let i = 0; i < careerScores.length; i++) {
    insertTvr.run(year, careerScores[i].id, i + 1, careerScores[i].total_points);
  }

  const trueRankings = db.prepare('SELECT * FROM true_value_rankings WHERE draft_year = ?').all(year);

  // 4. Get all boards for this draft year with entries
  const boards = db.prepare('SELECT * FROM big_boards WHERE draft_year = ?').all(year);

  // Build consensus from locked boards
  const allLockedEntries = db.prepare(`
    SELECT bbe.* FROM big_board_entries bbe
    JOIN big_boards bb ON bb.id = bbe.big_board_id
    WHERE bb.draft_year = ? AND bb.is_locked = 1
  `).all(year);
  const consensusRanking = buildConsensusRanking(allLockedEntries);
  const consensusRankMap = {};
  for (const cr of consensusRanking) {
    consensusRankMap[cr.player_id] = cr.consensus_rank;
  }

  // Consensus score (what the consensus board would score against true value)
  const consensusEntries = consensusRanking.map(cr => ({
    rank: cr.consensus_rank,
    player_id: cr.player_id,
  }));
  const consensusScores = calculateBoardScores(consensusEntries, trueRankings);
  const consensusWeightedScore = consensusScores.weighted_score;

  // 5. Score each board
  const upsertBoardScore = db.prepare(`
    INSERT INTO board_scores (big_board_id, all_around_score, first_round_score, second_round_score, weighted_score, consensus_plus_minus, calculated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(big_board_id) DO UPDATE SET
      all_around_score = excluded.all_around_score,
      first_round_score = excluded.first_round_score,
      second_round_score = excluded.second_round_score,
      weighted_score = excluded.weighted_score,
      consensus_plus_minus = excluded.consensus_plus_minus,
      calculated_at = excluded.calculated_at
  `);

  for (const board of boards) {
    const entries = db.prepare('SELECT * FROM big_board_entries WHERE big_board_id = ?').all(board.id);
    const scores = calculateBoardScores(entries, trueRankings);
    const pm = scores.weighted_score - consensusWeightedScore;
    upsertBoardScore.run(board.id, scores.all_around_score, scores.first_round_score, scores.second_round_score, scores.weighted_score, pm);
  }

  // 6. Recompute author reputation
  const authors = db.prepare(`
    SELECT DISTINCT bb.user_id FROM big_boards bb WHERE bb.draft_year = ?
  `).all(year);

  const upsertRep = db.prepare(`
    INSERT INTO author_reputation (user_id, rep_score, board_count, last_updated)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      rep_score = excluded.rep_score,
      board_count = excluded.board_count,
      last_updated = excluded.last_updated
  `);

  for (const author of authors) {
    const allScores = db.prepare(`
      SELECT bs.weighted_score FROM board_scores bs
      JOIN big_boards bb ON bb.id = bs.big_board_id
      WHERE bb.user_id = ?
    `).all(author.user_id);
    if (allScores.length === 0) continue;
    const avg = allScores.reduce((s, r) => s + r.weighted_score, 0) / allScores.length;
    upsertRep.run(author.user_id, avg, allScores.length);
  }

  return { ok: true, players: players.length, boards: boards.length };
}

module.exports = { calculateSeasonPoints, calculateBoardScores, buildConsensusRanking, recalculateForYear };
