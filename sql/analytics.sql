CREATE TABLE IF NOT EXISTS analytics_visits (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT DEFAULT 'Unknown',
  city TEXT DEFAULT 'Unknown',
  device TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'Unknown',
  os TEXT DEFAULT 'Unknown',
  referrer TEXT DEFAULT 'direct',
  visitor_id TEXT NOT NULL,
  session_duration_sec INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_analytics_visits_timestamp ON analytics_visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_path ON analytics_visits(path);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_visitor_id ON analytics_visits(visitor_id);
