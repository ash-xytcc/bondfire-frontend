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

function safeMessage(row = {}) {
  return {
    id: String(row.id || ''),
    orgId: String(row.org_id || row.orgId || ''),
    roomId: String(row.room_id || row.roomId || ''),
    body: row.encrypted_blob ? '' : String(row.body || ''),
    authorLabel: row.encrypted_blob ? '' : (row.author_label ? String(row.author_label) : ''),
    encrypted_blob: row.encrypted_blob || null,
    key_version: row.key_version == null ? null : Number(row.key_version),
    createdAt: Number(row.created_at || row.createdAt || 0),
  }
}

async function ensureChatMessagesTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    body TEXT NOT NULL,
    author_label TEXT,
    encrypted_blob TEXT,
    key_version INTEGER,
    created_at INTEGER NOT NULL
  )`).run()
  try { await db.prepare('ALTER TABLE chat_messages ADD COLUMN encrypted_blob TEXT').run() } catch {}
  try { await db.prepare('ALTER TABLE chat_messages ADD COLUMN key_version INTEGER').run() } catch {}
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_chat_messages_org_room_created ON chat_messages(org_id, room_id, created_at DESC)').run()
}

export async function onRequestGet({ env, params, request }) {
  try {
    const orgId = String(params?.orgId || '')
    const db = env?.BF_DB || env?.DB || null
    const url = new URL(request.url)
    const roomId = String(url.searchParams.get('roomId') || '').trim()
    if (!orgId) return bad(400, 'MISSING_ORG')
    if (!roomId) return bad(400, 'MISSING_ROOM')
    if (!db) return json({ ok: true, messages: [], scaffold: true })
    await ensureChatMessagesTable(db)
    const result = await db.prepare(
      'SELECT id, org_id, room_id, body, author_label, encrypted_blob, key_version, created_at FROM chat_messages WHERE org_id = ? AND room_id = ? ORDER BY created_at ASC'
    ).bind(orgId, roomId).all()
    return json({ ok: true, messages: (result.results || []).map(safeMessage) })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}

export async function onRequestPost({ env, params, request }) {
  try {
    const orgId = String(params?.orgId || '')
    const db = env?.BF_DB || env?.DB || null
    const payload = await request.json().catch(() => ({}))
    const roomId = String(payload?.roomId || '').trim()
    const encryptedBlob = String(payload?.encrypted_blob || '').trim()
    if (!orgId) return bad(400, 'MISSING_ORG')
    if (!roomId) return bad(400, 'MISSING_ROOM')
    if (!encryptedBlob) return bad(400, 'ENCRYPTED_BLOB_REQUIRED')
    const lockdown = await enforceOrgWriteLockdown({ env, orgId })
    if (!lockdown.ok) return lockdown.resp
    const id = uuid()
    const createdAt = Date.now()
    if (!db) return json({ ok: true, scaffold: true, message: { id, orgId, roomId, body: '', authorLabel: '', encrypted_blob: encryptedBlob, createdAt } })
    await ensureChatMessagesTable(db)
    const keyVersion = await getOrgCryptoKeyVersion(db, orgId)
    await db.prepare(
      'INSERT INTO chat_messages (id, org_id, room_id, body, author_label, encrypted_blob, key_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, orgId, roomId, '__encrypted__', '', encryptedBlob, keyVersion, createdAt).run()
    return json({ ok: true, message: { id, orgId, roomId, body: '', authorLabel: '', encrypted_blob: encryptedBlob, key_version: keyVersion, createdAt } })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}
