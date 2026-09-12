import { json, bad, uuid } from '../../../_lib/http.js'
import { enforceOrgWriteLockdown } from '../../../_lib/orgLockdown.js'

async function getOrgCryptoKeyVersion(db, orgId) {
  try {
    const row = await db.prepare('SELECT key_version FROM org_crypto WHERE org_id = ?').bind(orgId).first()
    return Number(row?.key_version) || 1
  } catch {
    try {
      const row = await db.prepare('SELECT version AS key_version FROM org_crypto WHERE org_id = ?').bind(orgId).first()
      return Number(row?.key_version) || 1
    } catch {
      return 1
    }
  }
}

function safeRoom(row = {}) {
  return {
    id: String(row.id || ''),
    name: row.encrypted_blob ? '' : String(row.name || 'room'),
    encrypted_blob: row.encrypted_blob || null,
    key_version: row.key_version == null ? null : Number(row.key_version),
    createdAt: row.created_at || row.createdAt || null,
  }
}

async function ensureChatRoomsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    encrypted_blob TEXT,
    key_version INTEGER,
    created_at INTEGER NOT NULL
  )`).run()
  try { await db.prepare('ALTER TABLE chat_rooms ADD COLUMN encrypted_blob TEXT').run() } catch {}
  try { await db.prepare('ALTER TABLE chat_rooms ADD COLUMN key_version INTEGER').run() } catch {}
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_chat_rooms_org_created ON chat_rooms(org_id, created_at DESC)').run()
}

export async function onRequestGet({ env, params }) {
  try {
    const orgId = String(params?.orgId || '')
    const db = env?.BF_DB || env?.DB || null
    if (!orgId) return bad(400, 'MISSING_ORG')
    if (!db) return json({ ok: true, rooms: [], scaffold: true })
    await ensureChatRoomsTable(db)
    const result = await db.prepare(
      'SELECT id, name, encrypted_blob, key_version, created_at FROM chat_rooms WHERE org_id = ? ORDER BY created_at DESC'
    ).bind(orgId).all()
    return json({ ok: true, rooms: (result.results || []).map(safeRoom) })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const orgId = String(params?.orgId || '')
    const db = env?.BF_DB || env?.DB || null
    const payload = await request.json().catch(() => ({}))
    const encryptedBlob = String(payload?.encrypted_blob || '').trim()
    if (!orgId) return bad(400, 'MISSING_ORG')
    if (!encryptedBlob) return bad(400, 'ENCRYPTED_BLOB_REQUIRED')
    const lockdown = await enforceOrgWriteLockdown({ env, orgId })
    if (!lockdown.ok) return lockdown.resp
    const id = uuid()
    const createdAt = Date.now()
    if (!db) return json({ ok: true, scaffold: true, room: { id, name: '', encrypted_blob: encryptedBlob, createdAt } })
    await ensureChatRoomsTable(db)
    const keyVersion = await getOrgCryptoKeyVersion(db, orgId)
    await db.prepare(
      'INSERT INTO chat_rooms (id, org_id, name, encrypted_blob, key_version, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, orgId, '__encrypted__', encryptedBlob, keyVersion, createdAt).run()
    return json({ ok: true, room: { id, name: '', encrypted_blob: encryptedBlob, key_version: keyVersion, createdAt } })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}
