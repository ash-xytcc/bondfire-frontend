import { bad, json, now, uuid } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";

async function ensureChatRoomsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    topic TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_org_updated ON chat_rooms(org_id, updated_at DESC)`).run();
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  await ensureChatRoomsTable(env.BF_DB);

  const rows = await env.BF_DB.prepare(
    `SELECT id, org_id, name, topic, created_at, updated_at
     FROM chat_rooms WHERE org_id = ? ORDER BY updated_at DESC, created_at DESC`
  ).bind(orgId).all();

  return json({ ok: true, rooms: rows.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureChatRoomsTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  if (!name) return bad(400, "MISSING_NAME");

  const id = uuid();
  const t = now();
  await env.BF_DB.prepare(
    `INSERT INTO chat_rooms (id, org_id, name, topic, created_at, updated_at) VALUES (?,?,?,?,?,?)`
  ).bind(id, orgId, name, String(body?.topic || ""), t, t).run();

  return json({ ok: true, room: { id, org_id: orgId, name, topic: String(body?.topic || ""), created_at: t, updated_at: t } });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureChatRoomsTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const id = String(body?.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  await env.BF_DB.prepare(
    `UPDATE chat_rooms
     SET name = COALESCE(?, name),
         topic = COALESCE(?, topic),
         updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(
    body?.name === undefined ? null : String(body.name || "").trim(),
    body?.topic === undefined ? null : String(body.topic || "").trim(),
    now(),
    id,
    orgId
  ).run();

  return json({ ok: true });
}
