export async function ensureSchema(env) {
  // Support multiple binding names across environments.
  // (This project uses BF_DB in several places.)
  const db = env?.BF_DB || env?.DB || env?.db;
  if (!db) throw new Error("NO_DB_BINDING");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY,
      name TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS org_memberships (
      org_id TEXT,
      user_id TEXT,
      role TEXT,
      created_at INTEGER,
      PRIMARY KEY (org_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS invites (
      code TEXT PRIMARY KEY,
      org_id TEXT,
      role TEXT,
      uses INTEGER DEFAULT 0,
      max_uses INTEGER,
      expires_at INTEGER,
      created_at INTEGER,
      created_by TEXT
    );
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
  agenda TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      starts_at INTEGER,
      ends_at INTEGER,
      is_public INTEGER NOT NULL DEFAULT 0,
      encrypted_notes TEXT,
      encrypted_blob TEXT,
      key_version INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_meetings_org ON meetings(org_id);
    CREATE INDEX IF NOT EXISTS idx_meetings_org_start ON meetings(org_id, starts_at);
    CREATE INDEX IF NOT EXISTS idx_meetings_public ON meetings(is_public);

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      encrypted_blob TEXT,
      key_version INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_inventory_org ON inventory(org_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_org_category ON inventory(org_id, category);

  `);
}
