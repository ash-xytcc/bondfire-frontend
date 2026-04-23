import { bad, json, now, uuid } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";
import { parseLinkedItem, serializeLinkedItem } from "../../../_lib/moduleLinks.js";

async function ensureChatMessagesTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    body TEXT NOT NULL,
    author_label TEXT,
    linked_item_json TEXT,
    created_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(org_id, room_id, created_at DESC)`).run();
}

function safeAuthorLabel(user) {
  const candidates = [
    user?.name,
    user?.preferred_username,
    user?.nickname,
    user?.email,
    user?.given_name,
  ];

  for (const value of candidates) {
    const trimmed = String(value || "").trim();
    if (trimmed) return trimmed;
  }
  return "member";
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  await ensureChatMessagesTable(env.BF_DB);

  const url = new URL(request.url);
  const roomId = String(url.searchParams.get("room_id") || "").trim();
  if (!roomId) return bad(400, "MISSING_ROOM_ID");

  const limitRaw = Number(url.searchParams.get("limit") || 50);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

  const rows = await env.BF_DB.prepare(
    `SELECT id, org_id, room_id, body, author_label, linked_item_json, created_at
     FROM chat_messages
     WHERE org_id = ? AND room_id = ?
     ORDER BY created_at DESC
     LIMIT ?`
  ).bind(orgId, roomId, limit).all();

  const messages = (rows.results || []).map((row) => ({
    ...row,
    linked_item: parseLinkedItem(row.linked_item_json),
  }));

  return json({ ok: true, messages });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureChatMessagesTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const roomId = String(body?.room_id || "").trim();
  const text = String(body?.body || "").trim();

  if (!roomId) return bad(400, "MISSING_ROOM_ID");
  if (!text) return bad(400, "MISSING_BODY");

  const id = uuid();
  const createdAt = now();
  const authorLabel = safeAuthorLabel(auth?.user);
  const linkedItemJson = serializeLinkedItem(body?.linked_item || null);

  await env.BF_DB.prepare(
    `INSERT INTO chat_messages (id, org_id, room_id, body, author_label, linked_item_json, created_at)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(id, orgId, roomId, text, authorLabel, linkedItemJson, createdAt).run();

  return json({
    ok: true,
    message: {
      id,
      org_id: orgId,
      room_id: roomId,
      body: text,
      author_label: authorLabel,
      linked_item_json: linkedItemJson,
      linked_item: parseLinkedItem(linkedItemJson),
      created_at: createdAt,
    },
  });
}
