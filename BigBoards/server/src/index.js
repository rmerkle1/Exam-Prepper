const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const draftClassRoutes = require('./routes/draftClasses');
const playerRoutes = require('./routes/players');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const scraperRoutes = require('./routes/scraper');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/draft-classes', draftClassRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/scrape', scraperRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`BigBoards server running on http://localhost:${PORT}`);
});
