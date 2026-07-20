export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  userId TEXT PRIMARY KEY,
  stage TEXT,
  symptoms TEXT NOT NULL DEFAULT '[]',
  triggers TEXT NOT NULL DEFAULT '[]',
  helps TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '[]',
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_entries (
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  mood TEXT,
  sleepQuality TEXT,
  symptoms TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY (userId, date)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  displayText TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_convo_user_created
  ON conversation_messages(userId, createdAt);
`;
