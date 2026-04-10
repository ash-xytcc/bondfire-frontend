CREATE TABLE IF NOT EXISTS orgs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  theme_json TEXT,
  modules_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES orgs(id)
);

CREATE TABLE IF NOT EXISTS people_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  record_type TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  source TEXT,
  status TEXT,
  sensitivity TEXT DEFAULT 'restricted',
  tags_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES orgs(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TEXT,
  ends_at TEXT,
  visibility TEXT DEFAULT 'internal',
  rsvp_enabled INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES orgs(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  visibility TEXT DEFAULT 'internal',
  send_to_newsletter INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES orgs(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  visibility TEXT DEFAULT 'restricted',
  folder TEXT,
  uploaded_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES orgs(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
