import { json, bad, uuid } from '../../../_lib/http.js'
import { requireOrgRole } from '../../../_lib/auth.js'
import { getOrgKeyVersion } from '../../../_lib/zk.js'

function hasCiphertext(value) {
  return typeof value === 'string' && value.trim().length > 0
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

function safeMessage(row = {}) {
  return {
    id: String(row.id || ''),
    orgId: String(row.org_id || row.orgId || ''),
    roomId: String(row.room_id || row.roomId || ''),
    body: String(row.body || ''),
    encrypted_blob: row.encrypted_blob || null,
    key_version: row.key_version ?? null,
    authorLabel: row.author_label ? String(row.author_label) : '',
    createdAt: Number(row.created_at || row.createdAt || 0),
  }
}

export async function onRequestGet({ env, params, request }) {
  try {
    const orgId = String(params?.orgId || '')
    if (!orgId) return bad(400, 'MISSING_ORG')
    const auth = await requireOrgRole({ env, request, orgId, minRole: 'viewer' })
    if (!auth.ok) return auth.resp
    const db = env?.BF_DB || env?.DB || null
    const url = new URL(request.url)
    const roomId = String(url.searchParams.get('roomId') || '').trim()
    if (!roomId) return bad(400, 'MISSING_ROOM')
    if (!db) return json({ ok: true, messages: [], scaffold: true })

    await ensureChatMessagesTable(db)
    await db.prepare("UPDATE chat_messages SET body = '' WHERE org_id = ? AND room_id = ? AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''").bind(orgId, roomId).run()
    const result = await db.prepare(
      'SELECT id, org_id, room_id, body, encrypted_blob, key_version, author_label, created_at FROM chat_messages WHERE org_id = ? AND room_id = ? ORDER BY created_at ASC'
    ).bind(orgId, roomId).all()
    return json({ ok: true, messages: (result.results || []).map(safeMessage) })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}

export async function onRequestPost({ env, params, request }) {
  try {
    const orgId = String(params?.orgId || '')
    if (!orgId) return bad(400, 'MISSING_ORG')
    const auth = await requireOrgRole({ env, request, orgId, minRole: 'member' })
    if (!auth.ok) return auth.resp
    const db = env?.BF_DB || env?.DB || null
    const payload = await request.json().catch(() => ({}))
    const roomId = String(payload?.roomId || '').trim()
    const encryptedBlob = payload?.encrypted_blob
    if (!roomId) return bad(400, 'MISSING_ROOM')
    if (!hasCiphertext(encryptedBlob)) return bad(400, 'ENCRYPTED_PAYLOAD_REQUIRED')
    if (!db) return bad(503, 'NO_DB')

    await ensureChatMessagesTable(db)
    const id = uuid()
    const createdAt = Date.now()
    const keyVersion = await getOrgKeyVersion(db, orgId)
    await db.prepare(
      'INSERT INTO chat_messages (id, org_id, room_id, body, author_label, encrypted_blob, key_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, orgId, roomId, '', '', encryptedBlob, keyVersion, createdAt).run()

    return json({ ok: true, message: { id, orgId, roomId, body: '', encrypted_blob: encryptedBlob, key_version: keyVersion, authorLabel: '', createdAt } })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}

export async function onRequestPut({ env, params, request }) {
  try {
    const orgId = String(params?.orgId || '')
    if (!orgId) return bad(400, 'MISSING_ORG')
    const auth = await requireOrgRole({ env, request, orgId, minRole: 'member' })
    if (!auth.ok) return auth.resp
    const db = env?.BF_DB || env?.DB || null
    if (!db) return bad(503, 'NO_DB')
    const payload = await request.json().catch(() => ({}))
    const id = String(payload?.id || '').trim()
    const encryptedBlob = payload?.encrypted_blob
    if (!id) return bad(400, 'MISSING_ID')
    if (!hasCiphertext(encryptedBlob)) return bad(400, 'ENCRYPTED_PAYLOAD_REQUIRED')
    await ensureChatMessagesTable(db)
    const keyVersion = await getOrgKeyVersion(db, orgId)
    await db.prepare(
      "UPDATE chat_messages SET body = '', encrypted_blob = ?, key_version = ? WHERE id = ? AND org_id = ?"
    ).bind(encryptedBlob, keyVersion, id, orgId).run()
    return json({ ok: true })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}
