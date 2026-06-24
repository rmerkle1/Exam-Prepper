const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// List players (filter by draft_year)
router.get('/', (req, res) => {
  const db = getDb();
  const { draft_year, q } = req.query;
  let query = `
    SELECT p.*, tvr.true_rank, tvr.career_points
    FROM players p
    LEFT JOIN true_value_rankings tvr ON tvr.player_id = p.id AND tvr.draft_year = p.draft_year
    WHERE 1=1
  `;
  const params = [];
  if (draft_year) { query += ' AND p.draft_year = ?'; params.push(parseInt(draft_year)); }
  if (q) { query += ' AND LOWER(p.name) LIKE ?'; params.push(`%${q.toLowerCase()}%`); }
  query += ' ORDER BY COALESCE(tvr.true_rank, p.draft_pick, 999)';
  res.json(db.prepare(query).all(...params));
});

// Get single player with season scores
router.get('/:id', (req, res) => {
  const db = getDb();
  const player = db.prepare(`
    SELECT p.*, tvr.true_rank, tvr.career_points,
      pcs.total_points, pcs.last_updated
    FROM players p
    LEFT JOIN true_value_rankings tvr ON tvr.player_id = p.id AND tvr.draft_year = p.draft_year
    LEFT JOIN player_career_scores pcs ON pcs.player_id = p.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const seasons = db.prepare('SELECT * FROM player_season_scores WHERE player_id = ? ORDER BY season_year').all(player.id);

  res.json({ ...player, seasons });
});

module.exports = router;
