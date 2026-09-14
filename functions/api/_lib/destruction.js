import { getDriveBucket } from './drive.js';
import { orgPrefix, scopedObjectKey } from './colophonScopedRuntime.js';

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ORG_KEY_TABLES = new Set(['org_private_device_wraps', 'org_crypto', 'org_keys', 'org_key_wrapped', 'org_key_recovery']);
const ACCOUNT_ORG_TABLES = new Set(['org_private_device_wraps', 'org_memberships', 'org_key_wrapped', 'org_key_recovery']);

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
    // D1 exposes internal tables such as _cf_KV in sqlite_master, but
    // rejects inspecting them with SQLITE_AUTH. They are not org data.
    .filter((name) => SAFE_IDENTIFIER.test(name) && !/^(?:sqlite_|_cf_)/i.test(name));
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

async function organizationScope(db, orgId) {
  const names = await listTables(db), prefix = orgPrefix(orgId);
  const scope = [{ name: 'orgs', columns: await tableColumns(db, 'orgs'), where: '"id" = ?', args: [orgId] }];
  const orgs = await db.prepare('SELECT id FROM orgs').all();
  if ((orgs.results || []).some((row) => row.id !== orgId && orgPrefix(row.id) === prefix)) throw new Error('STORAGE_NAMESPACE_COLLISION');
  for (const name of names) {
    const columns = await tableColumns(db, name);
    if (name.startsWith(prefix)) scope.push({ name, columns, where: '1=1', args: [] });
    else if (name !== 'orgs' && columns.some((column) => column.name === 'org_id')) scope.push({ name, columns, where: '"org_id" = ?', args: [orgId] });
  }
  // Include child tables which reference organization records but have no org_id.
  const unresolved = names.filter((name) => name !== 'orgs' && !scope.some((entry) => entry.name === name));
  for (let pass = 0; pass < names.length; pass += 1) {
    let added = false;
    for (const name of unresolved) {
      if (scope.some((entry) => entry.name === name)) continue;
      const keys = await db.prepare(`PRAGMA foreign_key_list(${quoted(name)})`).all();
      const predicates = [], args = [];
      const groups = new Map();
      for (const key of keys.results || []) {
        if (!groups.has(key.id)) groups.set(key.id, []);
        groups.get(key.id).push(key);
      }
      for (const group of groups.values()) {
        // Composite references need every column to match.
        const parent = scope.find((entry) => entry.name === group[0].table);
        if (!parent || group.some((key) => !key.to || !SAFE_IDENTIFIER.test(key.from) || !SAFE_IDENTIFIER.test(key.to))) continue;
        predicates.push(`(${group.map((key) => quoted(key.from)).join(',')}) IN (SELECT ${group.map((key) => quoted(key.to)).join(',')} FROM ${quoted(parent.name)} WHERE ${parent.where})`);
        args.push(...parent.args);
      }
      if (predicates.length) { scope.push({ name, columns: await tableColumns(db, name), where: predicates.map((clause) => `(${clause})`).join(' OR '), args }); added = true; }
    }
    if (!added) break;
  }
  return scope;
}

async function driveStorageKeys(db, orgId) {
  if (!(await tableExists(db, 'drive_files'))) return [];
  const result = await db
    .prepare('SELECT storage_key FROM drive_files WHERE org_id = ? AND storage_key IS NOT NULL')
    .bind(orgId)
    .all();
  return (result?.results || []).map((row) => String(row?.storage_key || '')).filter(Boolean);
}

async function listBucketKeys(bucket, prefix) {
  if (!bucket?.list) return [];
  const keys = [];
  let cursor = null;
  for (;;) {
    const result = await bucket.list({ prefix, ...(cursor ? { cursor } : {}) });
    for (const item of result?.objects || []) {
      const key = String(item?.key || '');
      if (key) keys.push(key);
    }
    if (!result?.truncated) break;
    const nextCursor = String(result?.cursor || '');
    if (!nextCursor || nextCursor === cursor) throw new Error('STORAGE_LIST_INCOMPLETE');
    cursor = nextCursor;
  }
  return keys;
}

export async function getOrgDestructionPreview({ db, orgId }) {
  const org = await db.prepare('SELECT id, name FROM orgs WHERE id = ? LIMIT 1').bind(orgId).first();
  if (!org) return null;

  const orgTables = await organizationScope(db, orgId);
  const tableCounts = {};
  let totalRows = 0;
  for (const { name, where, args } of orgTables) {
    const count = Number((await db.prepare(`SELECT COUNT(*) AS n FROM ${quoted(name)} WHERE ${where}`).bind(...args).first())?.n || 0);
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
      activeDataDeleted: false,
      keyMaterialDestroyed: false,
      fullHistoricalGuarantee: false,
      limitation: 'Provider backups, previously downloaded data, and keys saved on other devices are outside this deletion. Removing server keys alone does not erase copies held elsewhere.',
    },
  };
}

async function deletePublicCopies(env, orgId) {
  const store = env?.BF_PUBLIC;
  if (!store) return;
  let config = null;
  try {
    const raw = await store.get(`org:${orgId}`);
    config = raw ? JSON.parse(raw) : null;
  } catch {}
  const slug = String(config?.slug || '').trim().toLowerCase();
  if (slug && await store.get(`slug:${slug}`) === orgId) await store.delete(`slug:${slug}`);
  await store.delete(`org:${orgId}`);
}

async function deleteStorageCopies(env, db, orgId) {
  const drive = getDriveBucket(env);
  const referencedKeys = await driveStorageKeys(db, orgId);
  if (!drive && referencedKeys.length) {
    if (!(await tableExists(db, 'drive_file_blobs'))) throw new Error('DRIVE_STORAGE_UNAVAILABLE');
    const missing = await db.prepare(`SELECT f.id FROM drive_files f LEFT JOIN drive_file_blobs b ON b.file_id=f.id AND b.org_id=f.org_id
      WHERE f.org_id=? AND f.storage_key IS NOT NULL AND b.file_id IS NULL LIMIT 1`).bind(orgId).first();
    if (missing) throw new Error('DRIVE_STORAGE_UNAVAILABLE');
  }
  if (!drive) return 0;

  const keys = new Set(referencedKeys);
  for (const prefix of [`${orgId}/drive/`, scopedObjectKey('', orgId)]) {
    for (const key of await listBucketKeys(drive, prefix)) keys.add(key);
  }

  let deleted = 0;
  for (const key of keys) {
    const other = await db.prepare('SELECT id FROM drive_files WHERE storage_key=? AND org_id<>? LIMIT 1').bind(key, orgId).first();
    if (other) throw new Error('STORAGE_SCOPE_MISMATCH');
    await drive.delete(key);
    deleted += 1;
  }
  return deleted;
}

export async function destroyOrgData({ env, db, orgId }) {
  const preview = await getOrgDestructionPreview({ db, orgId });
  if (!preview) return null;
  const scope = await organizationScope(db, orgId);
  // Keep metadata and owner access until every external deletion succeeds.
  await deletePublicCopies(env, orgId);
  const deletedObjects = await deleteStorageCopies(env, db, orgId);
  // Descendants precede parents; deferred foreign keys handle cyclic references.
  // A failed batch rolls back the complete database deletion, retaining retry access.
  const statements = [db.prepare('PRAGMA defer_foreign_keys = ON')];
  for (const { name, where, args } of [...scope].reverse()) statements.push(db.prepare(`DELETE FROM ${quoted(name)} WHERE ${where}`).bind(...args));
  await db.batch(statements);
  return { orgId, deletedRows: preview.totalRows, deletedDriveObjects: Math.max(preview.driveObjectCount, deletedObjects), destroyedKeyMaterialRows: preview.keyMaterialRows };
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

export async function destroyAccountData({ db, userId }) {
  const blockers = await listSoleOwnedOrgs({ db, userId });
  if (blockers.length) return { ok: false, blockers };
  const referenceColumns = new Set(['actor_user_id', 'author_user_id', 'created_by', 'updated_by', 'updated_by_user_id',
    'lockdown_set_by_user_id', 'lockdown_cleared_by_user_id', 'isolated_by_user_id', 'recovered_by_user_id']);
  const tables = await listTables(db), statements = [db.prepare('PRAGMA defer_foreign_keys = ON')];
  const allowed = tables.includes('org_memberships') ? `NOT EXISTS (
    SELECT 1 FROM org_memberships mine WHERE mine.user_id=? AND mine.role='owner'
    AND NOT EXISTS (SELECT 1 FROM org_memberships other WHERE other.org_id=mine.org_id AND other.role='owner' AND other.user_id<>?)
  )` : '1=1';
  const guardArgs = tables.includes('org_memberships') ? [userId, userId] : [];
  for (const tableName of tables) {
    if (tableName === 'users') continue;
    const columns = await tableColumns(db, tableName);
    const hasUserId = columns.some((col) => col.name === 'user_id');
    const hasOrgId = columns.some((col) => col.name === 'org_id');
    if (hasUserId && (!hasOrgId || ACCOUNT_ORG_TABLES.has(tableName))) {
      statements.push(db.prepare(`DELETE FROM ${quoted(tableName)} WHERE user_id = ? AND ${allowed}`).bind(userId, ...guardArgs));
    }
    for (const column of columns) {
      if (referenceColumns.has(column.name) && !column.notNull) statements.push(db.prepare(`UPDATE ${quoted(tableName)} SET ${quoted(column.name)} = NULL WHERE ${quoted(column.name)} = ? AND ${allowed}`).bind(userId, ...guardArgs));
    }
  }
  if (tables.includes('rate_limits')) statements.push(db.prepare(`DELETE FROM rate_limits WHERE key = ? AND ${allowed}`).bind(`sensitive:${userId}`, ...guardArgs));
  statements.push(db.prepare(`DELETE FROM users WHERE id = ? AND ${allowed}`).bind(userId, ...guardArgs));
  const results = await db.batch(statements);
  if (Number(results.at(-1)?.meta?.changes) !== 1) {
    const remaining = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!remaining) return { ok: true };
    const currentBlockers = await listSoleOwnedOrgs({ db, userId });
    if (currentBlockers.length) return { ok: false, blockers: currentBlockers };
    throw new Error('ACCOUNT_DELETE_INCOMPLETE');
  }
  return { ok: true };
}
