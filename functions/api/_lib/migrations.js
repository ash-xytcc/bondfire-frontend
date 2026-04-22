export const APP_SCHEMA_VERSION = 1

const MIGRATIONS = [
  {
    version: 1,
    name: '001_schema_tracking_and_foundation',
    sql: [
      `CREATE TABLE IF NOT EXISTS app_schema_state (
        scope TEXT PRIMARY KEY,
        version INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS app_schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `INSERT OR IGNORE INTO app_schema_state (scope, version, updated_at)
       VALUES ('global', 0, CURRENT_TIMESTAMP);`,
      `CREATE INDEX IF NOT EXISTS idx_app_schema_migrations_version
       ON app_schema_migrations(version);`,
    ],
  },
]

export async function ensureMigrationTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_schema_state (
      scope TEXT PRIMARY KEY,
      version INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await db.exec(`
    INSERT OR IGNORE INTO app_schema_state (scope, version, updated_at)
    VALUES ('global', 0, CURRENT_TIMESTAMP);
  `)
}

export async function getSchemaState(db) {
  await ensureMigrationTables(db)

  const current =
    (await db
      .prepare(`SELECT scope, version, updated_at FROM app_schema_state WHERE scope = ? LIMIT 1`)
      .bind('global')
      .first()) || null

  const appliedResult = await db
    .prepare(`SELECT version, name, applied_at FROM app_schema_migrations ORDER BY version ASC, id ASC`)
    .all()

  return {
    currentVersion: Number(current?.version || 0),
    updatedAt: current?.updated_at || null,
    applied: Array.isArray(appliedResult?.results) ? appliedResult.results : [],
  }
}

export async function runAppMigrations(db) {
  await ensureMigrationTables(db)
  const before = await getSchemaState(db)
  const appliedNames = new Set(before.applied.map((item) => String(item.name)))
  const newlyApplied = []

  for (const migration of MIGRATIONS) {
    if (appliedNames.has(migration.name)) continue

    for (const statement of migration.sql) {
      await db.exec(statement)
    }

    await db
      .prepare(`
        INSERT OR IGNORE INTO app_schema_migrations (version, name, applied_at)
        VALUES (?, ?, ?)
      `)
      .bind(migration.version, migration.name, new Date().toISOString())
      .run()

    await db
      .prepare(`
        INSERT INTO app_schema_state (scope, version, updated_at)
        VALUES ('global', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(scope) DO UPDATE SET
          version = excluded.version,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(migration.version)
      .run()

    newlyApplied.push({ version: migration.version, name: migration.name })
  }

  const after = await getSchemaState(db)
  return {
    version: after.currentVersion,
    applied: newlyApplied,
    migrations: after.applied,
  }
}
