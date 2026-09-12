import { json, bad, uuid } from '../../../_lib/http.js'
import { requireOrgRole } from '../../../_lib/auth.js'
import { getOrgKeyVersion } from '../../../_lib/zk.js'

function hasCiphertext(value) {
  return typeof value === 'string' && value.trim().length > 0
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

function safeRoom(row = {}) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    encrypted_blob: row.encrypted_blob || null,
    key_version: row.key_version ?? null,
    createdAt: row.created_at || row.createdAt || null,
  }
}

export async function onRequestGet({ env, params, request }) {
  try {
    const orgId = String(params?.orgId || '')
    if (!orgId) return bad(400, 'MISSING_ORG')
    const auth = await requireOrgRole({ env, request, orgId, minRole: 'viewer' })
    if (!auth.ok) return auth.resp
    const db = env?.BF_DB || env?.DB || null
    if (!db) return json({ ok: true, rooms: [], scaffold: true })

    await ensureChatRoomsTable(db)
    await db.prepare("UPDATE chat_rooms SET name = '' WHERE org_id = ? AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''").bind(orgId).run()
    const result = await db.prepare('SELECT id, name, encrypted_blob, key_version, created_at FROM chat_rooms WHERE org_id = ? ORDER BY created_at DESC').bind(orgId).all()
    return json({ ok: true, rooms: (result.results || []).map(safeRoom) })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const orgId = String(params?.orgId || '')
    if (!orgId) return bad(400, 'MISSING_ORG')
    const auth = await requireOrgRole({ env, request, orgId, minRole: 'member' })
    if (!auth.ok) return auth.resp
    const db = env?.BF_DB || env?.DB || null
    const payload = await request.json().catch(() => ({}))
    const encryptedBlob = payload?.encrypted_blob
    if (!hasCiphertext(encryptedBlob)) return bad(400, 'ENCRYPTED_PAYLOAD_REQUIRED')
    if (!db) return bad(503, 'NO_DB')

    await ensureChatRoomsTable(db)
    const id = uuid()
    const createdAt = Date.now()
    const keyVersion = await getOrgKeyVersion(db, orgId)
    await db.prepare('INSERT INTO chat_rooms (id, org_id, name, encrypted_blob, key_version, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, orgId, '', encryptedBlob, keyVersion, createdAt).run()
    return json({ ok: true, room: { id, name: '', encrypted_blob: encryptedBlob, key_version: keyVersion, createdAt } })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}

export async function onRequestPut({ request, env, params }) {
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
    await ensureChatRoomsTable(db)
    const keyVersion = await getOrgKeyVersion(db, orgId)
    await db.prepare("UPDATE chat_rooms SET name = '', encrypted_blob = ?, key_version = ? WHERE id = ? AND org_id = ?").bind(encryptedBlob, keyVersion, id, orgId).run()
    return json({ ok: true })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}
