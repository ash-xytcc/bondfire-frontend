import { getDriveBucket } from './drive.js';

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ORG_KEY_TABLES = new Set(['org_crypto', 'org_keys', 'org_key_wrapped', 'org_key_recovery']);
const ACCOUNT_ORG_TABLES = new Set(['org_memberships', 'org_key_wrapped', 'org_key_recovery']);

function quoted(name) {
  if (!SAFE_IDENTIFIER.test(String(name || ''))) throw new Error('UNSAFE_TABLE_NAME');
  return `"${name}"`;
}

async function listTables(db) {
  const result = await db.prepare(
    `SELECT name FROM sqlite_master
     WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
     ORDER BY name ASC`
  ).all();
  return (result?.results || [])
    .map((row) => String(row?.name || ''))
    .filter((name) => SAFE_IDENTIFIER.test(name));
}

async function tableColumns(db, tableName) {
  const result = await db.prepare(`PRAGMA table_info(${quoted(tableName)})`).all();
  return (result?.results || []).map((row) => ({
    name: String(row?.name || ''),
    notNull: Number(row?.notnull || 0) === 1,
  }));
}

async function tableExists(db, tableName) {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1")
    .bind(tableName)
    .first();
  return !!row?.name;
}

async function tablesWithColumn(db, columnName) {
  const names = await listTables(db);
  const matches = [];
  for (const name of names) {
    const columns = await tableColumns(db, name);
    if (columns.some((col) => col.name === columnName)) matches.push({ name, columns });
  }
  return matches;
}

async function countByColumn(db, tableName, columnName, value) {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM ${quoted(tableName)} WHERE ${quoted(columnName)} = ?`)
    .bind(value)
    .first();
  return Number(row?.n || 0);
}

async function driveStorageKeys(db, orgId) {
  if (!(await tableExists(db, 'drive_files'))) return [];
  const result = await db
    .prepare('SELECT storage_key FROM drive_files WHERE org_id = ? AND storage_key IS NOT NULL')
    .bind(orgId)
    .all();
  return (result?.results || []).map((row) => String(row?.storage_key || '')).filter(Boolean);
}

export async function getOrgDestructionPreview({ db, orgId }) {
  const org = await db.prepare('SELECT id, name FROM orgs WHERE id = ? LIMIT 1').bind(orgId).first();
  if (!org) return null;

  const orgTables = await tablesWithColumn(db, 'org_id');
  const tableCounts = {};
  let totalRows = 0;
  for (const { name } of orgTables) {
    const count = await countByColumn(db, name, 'org_id', orgId);
    if (count > 0) tableCounts[name] = count;
    totalRows += count;
  }

  const memberCount = tableCounts.org_memberships || 0;
  const storageKeys = await driveStorageKeys(db, orgId);
  let keyRows = 0;
  for (const tableName of ORG_KEY_TABLES) keyRows += Number(tableCounts[tableName] || 0);

  return {
    org: { id: org.id, name: org.name },
    memberCount,
    totalRows,
    driveObjectCount: storageKeys.length,
    keyMaterialRows: keyRows,
    tableCounts,
    confirmationPhrase: `DESTROY ${String(org.name || '').trim()}`,
    erasure: {
      activeDataDeleted: true,
      keyMaterialDestroyed: keyRows > 0,
      fullHistoricalGuarantee: false,
      limitation: 'Legacy plaintext may still exist in provider-managed historical backups outside Bondfire control. Key-protected data becomes unrecoverable when its keys are destroyed.',
    },
  };
}

async function deleteOrgRowsWithRetries(db, orgId, excluded = new Set()) {
  const orgTables = (await tablesWithColumn(db, 'org_id'))
    .map((entry) => entry.name)
    .filter((name) => !excluded.has(name));

  let pending = [...orgTables];
  let lastErrors = [];
  for (let pass = 0; pass < 4 && pending.length; pass += 1) {
    const next = [];
    lastErrors = [];
    for (const tableName of pending) {
      try {
        await db.prepare(`DELETE FROM ${quoted(tableName)} WHERE org_id = ?`).bind(orgId).run();
      } catch (error) {
        next.push(tableName);
        lastErrors.push({ tableName, message: error?.message || String(error) });
      }
    }
    if (next.length === pending.length) break;
    pending = next;
  }

  if (pending.length) {
    const error = new Error('ORG_DELETE_INCOMPLETE');
    error.tables = pending;
    error.details = lastErrors;
    throw error;
  }
}

export async function destroyOrgData({ env, db, orgId }) {
  const preview = await getOrgDestructionPreview({ db, orgId });
  if (!preview) return null;

  const storageKeys = await driveStorageKeys(db, orgId);
  const bucket = getDriveBucket(env);
  if (bucket && storageKeys.length) {
    const failed = [];
    for (const key of storageKeys) {
      try {
        await bucket.delete(key);
      } catch {
        failed.push(key);
      }
    }
    if (failed.length) {
      const error = new Error('R2_DELETE_INCOMPLETE');
      error.failedCount = failed.length;
      throw error;
    }
  }

  for (const tableName of ORG_KEY_TABLES) {
    if (!(await tableExists(db, tableName))) continue;
    const columns = await tableColumns(db, tableName);
    if (!columns.some((col) => col.name === 'org_id')) continue;
    await db.prepare(`DELETE FROM ${quoted(tableName)} WHERE org_id = ?`).bind(orgId).run();
  }

  await deleteOrgRowsWithRetries(db, orgId, ORG_KEY_TABLES);
  await db.prepare('DELETE FROM orgs WHERE id = ?').bind(orgId).run();

  return {
    orgId,
    deletedRows: preview.totalRows,
    deletedDriveObjects: storageKeys.length,
    destroyedKeyMaterialRows: preview.keyMaterialRows,
  };
}

export async function listSoleOwnedOrgs({ db, userId }) {
  if (!(await tableExists(db, 'org_memberships'))) return [];
  const result = await db.prepare(
    `SELECT o.id, o.name
     FROM org_memberships mine
     JOIN orgs o ON o.id = mine.org_id
     WHERE mine.user_id = ? AND mine.role = 'owner'
       AND 1 = (
         SELECT COUNT(*) FROM org_memberships owners
         WHERE owners.org_id = mine.org_id AND owners.role = 'owner'
       )
     ORDER BY o.name ASC`
  ).bind(userId).all();
  return (result?.results || []).map((row) => ({ id: row.id, name: row.name }));
}

async function nullIdentityReferences(db, userId) {
  const referenceColumns = new Set([
    'actor_user_id',
    'created_by',
    'updated_by',
    'updated_by_user_id',
    'lockdown_set_by_user_id',
    'lockdown_cleared_by_user_id',
  ]);
  const tables = await listTables(db);
  for (const tableName of tables) {
    if (tableName === 'users') continue;
    const columns = await tableColumns(db, tableName);
    for (const column of columns) {
      if (!referenceColumns.has(column.name) || column.notNull) continue;
      try {
        await db
          .prepare(`UPDATE ${quoted(tableName)} SET ${quoted(column.name)} = NULL WHERE ${quoted(column.name)} = ?`)
          .bind(userId)
          .run();
      } catch {
        // Identity scrubbing is best-effort for legacy tables with unusual constraints.
      }
    }
  }
}

export async function destroyAccountData({ db, userId }) {
  const blockers = await listSoleOwnedOrgs({ db, userId });
  if (blockers.length) return { ok: false, blockers };

  const tables = await listTables(db);
  for (const tableName of tables) {
    if (tableName === 'users') continue;
    const columns = await tableColumns(db, tableName);
    const hasUserId = columns.some((col) => col.name === 'user_id');
    if (!hasUserId) continue;
    const hasOrgId = columns.some((col) => col.name === 'org_id');
    if (hasOrgId && !ACCOUNT_ORG_TABLES.has(tableName)) continue;
    await db.prepare(`DELETE FROM ${quoted(tableName)} WHERE user_id = ?`).bind(userId).run();
  }

  await nullIdentityReferences(db, userId);
  await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
  return { ok: true };
}
