CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS draft_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER UNIQUE NOT NULL,
  lock_date TEXT NOT NULL,
  is_locked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  draft_year INTEGER NOT NULL,
  draft_pick INTEGER,
  draft_team TEXT,
  bball_ref_id TEXT,
  position TEXT,
  FOREIGN KEY (draft_year) REFERENCES draft_classes(year)
);

CREATE TABLE IF NOT EXISTS big_boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  draft_year INTEGER NOT NULL,
  title TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  is_locked INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (draft_year) REFERENCES draft_classes(year)
);

CREATE TABLE IF NOT EXISTS big_board_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  big_board_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  player_id INTEGER,
  team TEXT,
  notes TEXT,
  FOREIGN KEY (big_board_id) REFERENCES big_boards(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS player_season_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  season_year INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_started INTEGER DEFAULT 0,
  is_allstar INTEGER DEFAULT 0,
  is_allnba INTEGER DEFAULT 0,
  is_mvp INTEGER DEFAULT 0,
  is_alldefense INTEGER DEFAULT 0,
  is_allrookie INTEGER DEFAULT 0,
  is_roy INTEGER DEFAULT 0,
  is_sixth_man INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  is_final INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, season_year),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS player_career_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  last_updated TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS true_value_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_year INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  true_rank INTEGER NOT NULL,
  career_points INTEGER DEFAULT 0,
  calculated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(draft_year, player_id),
  FOREIGN KEY (draft_year) REFERENCES draft_classes(year),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS board_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  big_board_id INTEGER UNIQUE NOT NULL,
  all_around_score REAL DEFAULT 0,
  first_round_score REAL DEFAULT 0,
  second_round_score REAL DEFAULT 0,
  weighted_score REAL DEFAULT 0,
  consensus_plus_minus REAL DEFAULT 0,
  calculated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (big_board_id) REFERENCES big_boards(id)
);

CREATE TABLE IF NOT EXISTS author_reputation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  rep_score REAL DEFAULT 0,
  board_count INTEGER DEFAULT 0,
  last_updated TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
