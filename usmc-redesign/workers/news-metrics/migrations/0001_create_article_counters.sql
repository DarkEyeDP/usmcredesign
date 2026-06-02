CREATE TABLE IF NOT EXISTS article_counters (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  reads INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_counters_updated_at
  ON article_counters (updated_at);
