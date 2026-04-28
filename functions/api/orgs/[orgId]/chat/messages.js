import { json, bad, uuid } from '../../../_lib/http.js'
import { enforceOrgWriteLockdown } from '../../../_lib/orgLockdown.js'

function safeMessage(row = {}) {
  return {
    id: String(row.id || ''),
    orgId: String(row.org_id || row.orgId || ''),
    roomId: String(row.room_id || row.roomId || ''),
    body: String(row.body || ''),
    authorLabel: row.author_label ? String(row.author_label) : '',
    createdAt: Number(row.created_at || row.createdAt || 0),
  }
}

async function ensureChatMessagesTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      body TEXT NOT NULL,
      author_label TEXT,
      created_at INTEGER NOT NULL
    )`
  ).run()

  await db.prepare(
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_org_room_created ON chat_messages(org_id, room_id, created_at DESC)'
  ).run()
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
      'SELECT id, org_id, room_id, body, author_label, created_at FROM chat_messages WHERE org_id = ? AND room_id = ? ORDER BY created_at ASC'
    ).bind(orgId, roomId).all()

    return json({
      ok: true,
      messages: (result.results || []).map(safeMessage),
    })
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
    const body = String(payload?.body || '').trim()

    if (!orgId) return bad(400, 'MISSING_ORG')
    if (!roomId) return bad(400, 'MISSING_ROOM')
    if (!body) return bad(400, 'MISSING_BODY')
    const lockdown = await enforceOrgWriteLockdown({ env, orgId })
    if (!lockdown.ok) return lockdown.resp

    if (!db) {
      return json({
        ok: true,
        scaffold: true,
        message: {
          id: uuid(),
          orgId,
          roomId,
          body,
          authorLabel: '',
          createdAt: Date.now(),
        },
      })
    }

    await ensureChatMessagesTable(db)

    const id = uuid()
    const createdAt = Date.now()

    await db.prepare(
      'INSERT INTO chat_messages (id, org_id, room_id, body, author_label, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, orgId, roomId, body, '', createdAt).run()

    return json({
      ok: true,
      message: {
        id,
        orgId,
        roomId,
        body,
        authorLabel: '',
        createdAt,
      },
    })
  } catch (error) {
    return bad(500, 'INTERNAL', { detail: String(error?.message || error || 'Unknown error') })
  }
}
