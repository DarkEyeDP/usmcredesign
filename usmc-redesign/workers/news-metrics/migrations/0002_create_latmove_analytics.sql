CREATE TABLE IF NOT EXISTS latmove_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gt_bucket TEXT,
  mm_bucket TEXT,
  el_bucket TEXT,
  cl_bucket TEXT,
  rank TEXT,
  clearance TEXT,
  pmos TEXT,
  result_count INTEGER NOT NULL DEFAULT 0,
  has_certs INTEGER NOT NULL DEFAULT 0,
  has_degrees INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_latmove_searches_created_at ON latmove_searches (created_at);
CREATE INDEX IF NOT EXISTS idx_latmove_searches_rank ON latmove_searches (rank);
CREATE INDEX IF NOT EXISTS idx_latmove_searches_pmos ON latmove_searches (pmos);

CREATE TABLE IF NOT EXISTS latmove_mos_impressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_id INTEGER NOT NULL,
  mos_id TEXT NOT NULL,
  mos_title TEXT NOT NULL,
  mos_field TEXT NOT NULL,
  position INTEGER NOT NULL,
  match_score INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (search_id) REFERENCES latmove_searches(id)
);

CREATE INDEX IF NOT EXISTS idx_latmove_mos_impressions_mos_id ON latmove_mos_impressions (mos_id);
CREATE INDEX IF NOT EXISTS idx_latmove_mos_impressions_search_id ON latmove_mos_impressions (search_id);

CREATE TABLE IF NOT EXISTS latmove_mos_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mos_id TEXT NOT NULL,
  mos_title TEXT NOT NULL,
  mos_field TEXT NOT NULL,
  rank TEXT,
  pmos TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_latmove_mos_clicks_mos_id ON latmove_mos_clicks (mos_id);
CREATE INDEX IF NOT EXISTS idx_latmove_mos_clicks_created_at ON latmove_mos_clicks (created_at);
