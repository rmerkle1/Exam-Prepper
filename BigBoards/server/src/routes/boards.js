const express = require('express');
const multer = require('multer');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { parseAndValidateCsv } = require('../utils/csv');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// List boards
router.get('/', (req, res) => {
  const db = getDb();
  const { draft_year, user_id, limit = 50, offset = 0 } = req.query;
  let query = `
    SELECT bb.*, u.username, bs.weighted_score, bs.all_around_score
    FROM big_boards bb
    JOIN users u ON u.id = bb.user_id
    LEFT JOIN board_scores bs ON bs.big_board_id = bb.id
    WHERE 1=1
  `;
  const params = [];
  if (draft_year) { query += ' AND bb.draft_year = ?'; params.push(parseInt(draft_year)); }
  if (user_id) { query += ' AND bb.user_id = ?'; params.push(parseInt(user_id)); }
  query += ' ORDER BY bb.submitted_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  res.json(db.prepare(query).all(...params));
});

// Get single board with entries
router.get('/:id', (req, res) => {
  const db = getDb();
  const board = db.prepare(`
    SELECT bb.*, u.username, bs.weighted_score, bs.all_around_score,
      bs.first_round_score, bs.second_round_score, bs.consensus_plus_minus
    FROM big_boards bb
    JOIN users u ON u.id = bb.user_id
    LEFT JOIN board_scores bs ON bs.big_board_id = bb.id
    WHERE bb.id = ?
  `).get(req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const entries = db.prepare(`
    SELECT bbe.*, p.name as matched_player_name, p.draft_pick, p.draft_team,
      tvr.true_rank, tvr.career_points,
      CASE WHEN tvr.true_rank IS NOT NULL
        THEN MAX(0.0, 1.0 - ABS(bbe.rank - tvr.true_rank) / 60.0)
        ELSE NULL END as player_score
    FROM big_board_entries bbe
    LEFT JOIN players p ON p.id = bbe.player_id
    LEFT JOIN true_value_rankings tvr ON tvr.player_id = bbe.player_id AND tvr.draft_year = ?
    WHERE bbe.big_board_id = ?
    ORDER BY bbe.rank ASC
  `).all(board.draft_year, board.id);

  res.json({ ...board, entries });
});

// Upload big board CSV
router.post('/', authMiddleware, upload.single('csv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }

  let parsed;
  try {
    parsed = parseAndValidateCsv(req.file.buffer);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const db = getDb();

  // Check draft class exists and is not locked
  const draftClass = db.prepare('SELECT * FROM draft_classes WHERE year = ?').get(parsed.draftYear);
  if (!draftClass) {
    return res.status(400).json({ error: `Draft class ${parsed.draftYear} not found. An admin must create it first.` });
  }

  const now = new Date().toISOString().split('T')[0];
  if (draftClass.lock_date && now >= draftClass.lock_date) {
    return res.status(403).json({ error: `Submissions for ${parsed.draftYear} are locked (season starts ${draftClass.lock_date})` });
  }

  // Check if user already submitted for this year
  const existing = db.prepare('SELECT id FROM big_boards WHERE user_id = ? AND draft_year = ?').get(req.user.id, parsed.draftYear);
  if (existing) {
    return res.status(409).json({ error: `You already submitted a board for ${parsed.draftYear}. Delete it first to re-submit.` });
  }

  const title = req.body.title || `${req.user.username} ${parsed.draftYear} Big Board`;

  const insertBoard = db.prepare(
    'INSERT INTO big_boards (user_id, draft_year, title) VALUES (?, ?, ?)'
  );
  const insertEntry = db.prepare(
    'INSERT INTO big_board_entries (big_board_id, rank, player_name, player_id, team, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const boardResult = insertBoard.run(req.user.id, parsed.draftYear, title);
  const boardId = boardResult.lastInsertRowid;

  // Try to auto-match player names
  const matchPlayer = db.prepare(
    "SELECT id FROM players WHERE draft_year = ? AND LOWER(name) = LOWER(?)"
  );

  for (const entry of parsed.entries) {
    let playerId = entry.player_id || null;
    if (!playerId) {
      const match = matchPlayer.get(parsed.draftYear, entry.player_name);
      if (match) playerId = match.id;
    }
    insertEntry.run(boardId, entry.rank, entry.player_name, playerId, entry.team, entry.notes);
  }

  res.status(201).json({ id: boardId, draft_year: parsed.draftYear, title, entries: parsed.entries.length });
});

// Delete own board (pre-lock only)
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const board = db.prepare('SELECT * FROM big_boards WHERE id = ?').get(req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found' });
  if (board.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (board.is_locked && !req.user.is_admin) {
    return res.status(403).json({ error: 'Board is locked and cannot be deleted' });
  }
  db.prepare('DELETE FROM big_board_entries WHERE big_board_id = ?').run(board.id);
  db.prepare('DELETE FROM board_scores WHERE big_board_id = ?').run(board.id);
  db.prepare('DELETE FROM big_boards WHERE id = ?').run(board.id);
  res.json({ ok: true });
});

module.exports = router;
