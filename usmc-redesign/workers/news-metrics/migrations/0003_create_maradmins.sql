CREATE TABLE IF NOT EXISTS maradmins (
  number       TEXT    PRIMARY KEY,   -- "123/26"
  subject      TEXT    NOT NULL,
  date         TEXT    NOT NULL,      -- "01 JUN 2026"
  display_date TEXT    NOT NULL,
  month        TEXT    NOT NULL,      -- "JUNE 2026"
  source       TEXT    NOT NULL DEFAULT 'HQMC',
  link         TEXT    NOT NULL DEFAULT '',
  tags         TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  sort_key     INTEGER NOT NULL DEFAULT 0,     -- year*10000+seq for correct ordering
  published_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- YYYY-MM-DD
  fetched_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maradmins_sort_key    ON maradmins (sort_key DESC);
CREATE INDEX IF NOT EXISTS idx_maradmins_published   ON maradmins (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_maradmins_month       ON maradmins (month);

CREATE TABLE IF NOT EXISTS maradmin_articles (
  number    TEXT PRIMARY KEY,
  text      TEXT NOT NULL,
  source    TEXT,
  method    TEXT,
  cached_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Key-value store for worker internal state (e.g. archive backfill cursor)
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
