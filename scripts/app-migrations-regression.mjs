import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { APP_SCHEMA_VERSION, getSchemaState, runAppMigrations } from '../functions/api/_lib/migrations.js';

function makeD1() {
  const sqlite = new DatabaseSync(':memory:');
  return {
    sqlite,
    db: {
      prepare(sql) {
        const statement = sqlite.prepare(sql);
        let values = [];
        return {
          bind(...next) { values = next; return this; },
          async first() { return statement.get(...values) || null; },
          async all() { return { results: statement.all(...values) }; },
          async run() { return { success: true, meta: statement.run(...values) }; },
        };
      },
      async exec(sql) { sqlite.exec(sql); },
    },
  };
}

const { sqlite, db } = makeD1();
const first = await runAppMigrations(db);
assert.equal(first.version, APP_SCHEMA_VERSION);
assert.deepEqual(first.applied.map((item) => item.version), [1, 2, 3, 4, 5, 6]);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM app_schema_migrations').get().n, 6);
assert.equal(sqlite.prepare("SELECT version FROM app_schema_state WHERE scope='global'").get().version, APP_SCHEMA_VERSION);

for (const table of ['public_site_configs', 'native_public_content', 'native_public_content_revisions', 'native_content_sources', 'media_assets', 'org_module_configs']) {
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=?").get(table).n, 1, `${table} must exist`);
}

const second = await runAppMigrations(db);
assert.equal(second.version, APP_SCHEMA_VERSION);
assert.deepEqual(second.applied, []);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM app_schema_migrations').get().n, 6, 'rerun must not duplicate migrations');

const state = await getSchemaState(db);
assert.equal(state.currentVersion, APP_SCHEMA_VERSION);
assert.deepEqual(state.applied.map((item) => item.name), [
  '001_schema_tracking',
  '002_public_site_config',
  '003_native_content',
  '004_media_assets',
  '005_schema_state_sync',
  '006_org_module_configs',
]);

console.log('PASS: app migrations apply deterministically and rerun idempotently at schema version', APP_SCHEMA_VERSION);
