import { bad, json, now } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";
import { getOrgKeyVersion } from "../../../_lib/zk.js";

async function ensureEventsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    starts_at INTEGER,
    ends_at INTEGER,
    tags_json TEXT,
    encrypted_blob TEXT,
    key_version INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  try { await db.prepare("ALTER TABLE events ADD COLUMN tags_json TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE events ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE events ADD COLUMN key_version INTEGER").run(); } catch {}
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_events_org_time ON events(org_id, starts_at DESC, created_at DESC)").run();
}

function hasCiphertext(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const eventId = params.eventId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);

  await env.BF_DB.prepare(
    `UPDATE events SET title = '', description = '', location = '', tags_json = ''
     WHERE id = ? AND org_id = ? AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''`
  ).bind(eventId, orgId).run();

  const row = await env.BF_DB.prepare(
    `SELECT id, title, description, location, starts_at, ends_at, tags_json,
            encrypted_blob, key_version, created_at, updated_at
     FROM events WHERE id = ? AND org_id = ?`
  ).bind(eventId, orgId).first();
  if (!row) return bad(404, "NOT_FOUND");
  return json({ ok: true, event: row });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const eventId = params.eventId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const existing = await env.BF_DB.prepare(
    "SELECT encrypted_blob, key_version, starts_at, ends_at FROM events WHERE id = ? AND org_id = ?"
  ).bind(eventId, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : existing.encrypted_blob;
  if (!hasCiphertext(encryptedBlob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");
  const startsAt = body.starts_at === undefined ? existing.starts_at : (Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : existing.starts_at);
  const endsAt = body.ends_at === undefined ? existing.ends_at : (Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : existing.ends_at);
  const keyVersion = hasCiphertext(body.encrypted_blob) ? await getOrgKeyVersion(env.BF_DB, orgId) : existing.key_version;

  await env.BF_DB.prepare(
    `UPDATE events SET title = '', description = '', location = '', tags_json = '',
      starts_at = ?, ends_at = ?, encrypted_blob = ?, key_version = ?, updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(startsAt, endsAt, encryptedBlob, keyVersion, now(), eventId, orgId).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const eventId = params.eventId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);
  await env.BF_DB.prepare("DELETE FROM events WHERE id = ? AND org_id = ?").bind(eventId, orgId).run();
  return json({ ok: true });
}
