const express = require('express');
const { getDb } = require('../db');
const { buildConsensusRanking } = require('../utils/scoring');

const router = express.Router();

// List all draft classes
router.get('/', (req, res) => {
  const db = getDb();
  const classes = db.prepare(`
    SELECT dc.*,
      (SELECT COUNT(*) FROM players WHERE draft_year = dc.year) as player_count,
      (SELECT COUNT(*) FROM big_boards WHERE draft_year = dc.year) as board_count
    FROM draft_classes dc
    ORDER BY dc.year DESC
  `).all();
  res.json(classes);
});

// Get a draft class with players
router.get('/:year', (req, res) => {
  const db = getDb();
  const year = parseInt(req.params.year);
  const dc = db.prepare('SELECT * FROM draft_classes WHERE year = ?').get(year);
  if (!dc) return res.status(404).json({ error: 'Draft class not found' });

  const players = db.prepare(`
    SELECT p.*, tvr.true_rank, tvr.career_points
    FROM players p
    LEFT JOIN true_value_rankings tvr ON tvr.player_id = p.id AND tvr.draft_year = p.draft_year
    WHERE p.draft_year = ?
    ORDER BY COALESCE(tvr.true_rank, 999)
  `).all(year);

  const boardCount = db.prepare('SELECT COUNT(*) as cnt FROM big_boards WHERE draft_year = ?').get(year);

  res.json({ ...dc, players, board_count: boardCount.cnt });
});

// True value ranking for a draft class
router.get('/:year/true-value', (req, res) => {
  const db = getDb();
  const year = parseInt(req.params.year);
  const rankings = db.prepare(`
    SELECT tvr.*, p.name, p.draft_pick, p.draft_team, p.position, p.bball_ref_id
    FROM true_value_rankings tvr
    JOIN players p ON p.id = tvr.player_id
    WHERE tvr.draft_year = ?
    ORDER BY tvr.true_rank ASC
  `).all(year);
  res.json(rankings);
});

// All boards for a draft class
router.get('/:year/boards', (req, res) => {
  const db = getDb();
  const year = parseInt(req.params.year);
  const boards = db.prepare(`
    SELECT bb.*, u.username,
      bs.all_around_score, bs.first_round_score, bs.second_round_score,
      bs.weighted_score, bs.consensus_plus_minus
    FROM big_boards bb
    JOIN users u ON u.id = bb.user_id
    LEFT JOIN board_scores bs ON bs.big_board_id = bb.id
    WHERE bb.draft_year = ?
    ORDER BY bs.weighted_score DESC NULLS LAST
  `).all(year);
  res.json(boards);
});

// Consensus board for a draft class
router.get('/:year/consensus', (req, res) => {
  const db = getDb();
  const year = parseInt(req.params.year);

  const allEntries = db.prepare(`
    SELECT bbe.player_id, bbe.player_name, bbe.rank
    FROM big_board_entries bbe
    JOIN big_boards bb ON bb.id = bbe.big_board_id
    WHERE bb.draft_year = ? AND bb.is_locked = 1 AND bbe.player_id IS NOT NULL
  `).all(year);

  if (allEntries.length === 0) {
    return res.json([]);
  }

  const consensus = buildConsensusRanking(allEntries);

  // Enrich with player info
  const playerIds = consensus.map(c => c.player_id);
  const playerMap = {};
  db.prepare(`SELECT id, name, draft_pick, position FROM players WHERE id IN (${playerIds.map(() => '?').join(',')})`).all(...playerIds)
    .forEach(p => { playerMap[p.id] = p; });

  res.json(consensus.map(c => ({ ...c, player: playerMap[c.player_id] || null })));
});

module.exports = router;
