const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// Main leaderboard
router.get('/', (req, res) => {
  const db = getDb();
  const {
    sort = 'rep_score',
    draft_year,
    min_boards = 1,
    limit = 50,
    offset = 0,
  } = req.query;

  const validSorts = ['rep_score', 'all_around_score', 'first_round_score', 'second_round_score', 'weighted_score', 'consensus_plus_minus', 'board_count'];
  const sortCol = validSorts.includes(sort) ? sort : 'rep_score';

  if (draft_year) {
    // Filter to single draft year
    const rows = db.prepare(`
      SELECT u.id as user_id, u.username,
        bs.all_around_score, bs.first_round_score, bs.second_round_score,
        bs.weighted_score, bs.consensus_plus_minus,
        bb.id as board_id, bb.title, bb.submitted_at
      FROM big_boards bb
      JOIN users u ON u.id = bb.user_id
      LEFT JOIN board_scores bs ON bs.big_board_id = bb.id
      WHERE bb.draft_year = ?
      ORDER BY bs.${sortCol} DESC NULLS LAST
      LIMIT ? OFFSET ?
    `).all(parseInt(draft_year), parseInt(limit), parseInt(offset));
    return res.json(rows);
  }

  // All-time leaderboard
  const rows = db.prepare(`
    SELECT u.id as user_id, u.username,
      ar.rep_score, ar.board_count
    FROM author_reputation ar
    JOIN users u ON u.id = ar.user_id
    WHERE ar.board_count >= ?
    ORDER BY ar.${sortCol === 'rep_score' || sortCol === 'board_count' ? sortCol : 'rep_score'} DESC
    LIMIT ? OFFSET ?
  `).all(parseInt(min_boards), parseInt(limit), parseInt(offset));

  res.json(rows);
});

// Author profile
router.get('/authors/:userId', (req, res) => {
  const db = getDb();
  const userId = parseInt(req.params.userId);

  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'Author not found' });

  const rep = db.prepare('SELECT * FROM author_reputation WHERE user_id = ?').get(userId);

  // Compute leaderboard rank
  const rank = db.prepare(`
    SELECT COUNT(*) + 1 as rank FROM author_reputation
    WHERE rep_score > COALESCE((SELECT rep_score FROM author_reputation WHERE user_id = ?), -1)
  `).get(userId);

  const boards = db.prepare(`
    SELECT bb.*, bs.all_around_score, bs.first_round_score, bs.second_round_score,
      bs.weighted_score, bs.consensus_plus_minus, bs.calculated_at as scored_at
    FROM big_boards bb
    LEFT JOIN board_scores bs ON bs.big_board_id = bb.id
    WHERE bb.user_id = ?
    ORDER BY bb.draft_year DESC
  `).all(userId);

  res.json({
    ...user,
    rep_score: rep ? rep.rep_score : null,
    board_count: rep ? rep.board_count : 0,
    leaderboard_rank: rank.rank,
    boards,
  });
});

module.exports = router;
