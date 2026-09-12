import { bad, json, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { getOrgKeyVersion } from "../../_lib/zk.js";

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

async function scrubEncryptedPlaintext(db, orgId) {
  await db.prepare(
    `UPDATE events SET title = '', description = '', location = '', tags_json = ''
     WHERE org_id = ? AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''`
  ).bind(orgId).run();
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);
  await scrubEncryptedPlaintext(env.BF_DB, orgId);

  const rows = await env.BF_DB.prepare(
    `SELECT id, title, description, location, starts_at, ends_at, tags_json,
            encrypted_blob, key_version, created_at, updated_at
     FROM events WHERE org_id = ? ORDER BY starts_at DESC, created_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, events: rows.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  if (!hasCiphertext(body.encrypted_blob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");
  const startsAt = Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : null;
  const endsAt = Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : null;
  const keyVersion = await getOrgKeyVersion(env.BF_DB, orgId);
  const id = uuid();
  const t = now();

  await env.BF_DB.prepare(
    `INSERT INTO events (id, org_id, title, description, location, starts_at, ends_at, tags_json, encrypted_blob, key_version, created_at, updated_at)
     VALUES (?, ?, '', '', '', ?, ?, '', ?, ?, ?, ?)`
  ).bind(id, orgId, startsAt, endsAt, body.encrypted_blob, keyVersion, t, t).run();
  return json({ ok: true, id });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");
  const existing = await env.BF_DB.prepare("SELECT encrypted_blob, key_version, starts_at, ends_at FROM events WHERE id = ? AND org_id = ?").bind(id, orgId).first();
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
  ).bind(startsAt, endsAt, encryptedBlob, keyVersion, now(), id, orgId).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);
  const url = new URL(request.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!id) return bad(400, "MISSING_ID");
  await env.BF_DB.prepare("DELETE FROM events WHERE id = ? AND org_id = ?").bind(id, orgId).run();
  return json({ ok: true });
}
