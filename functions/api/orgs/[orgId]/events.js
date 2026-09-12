import { bad, json, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";

async function getOrgCryptoKeyVersion(db, orgId) {
  try {
    const row = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(row?.key_version) || 1;
  } catch {
    try {
      const row = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
      return Number(row?.key_version) || 1;
    } catch {
      return 1;
    }
  }
}

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

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag ?? "").trim()).filter(Boolean).slice(0, 50);
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return normalizeTags(parsed);
    } catch {}
    return text.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 50);
  }
  return [];
}

function eventForClient(row) {
  if (!row) return row;
  if (row.encrypted_blob) {
    return {
      ...row,
      title: "",
      description: "",
      location: "",
      tags_json: "[]",
      tags: [],
    };
  }
  return { ...row, tags: normalizeTags(row.tags_json) };
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);
  const rows = await env.BF_DB.prepare(
    `SELECT id, title, description, location, starts_at, ends_at, tags_json, encrypted_blob, key_version, created_at, updated_at
     FROM events WHERE org_id = ? ORDER BY starts_at DESC, created_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, events: (rows.results || []).map(eventForClient) });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureEventsTable(env.BF_DB);
  const body = await request.json().catch(() => ({}));
  const encryptedBlob = String(body.encrypted_blob || "").trim();
  if (!encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const startsAt = Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : null;
  const endsAt = Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : null;
  const keyVersion = await getOrgCryptoKeyVersion(env.BF_DB, orgId);
  const id = uuid();
  const t = now();
  await env.BF_DB.prepare(
    `INSERT INTO events (id, org_id, title, description, location, starts_at, ends_at, tags_json, encrypted_blob, key_version, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, orgId, "__encrypted__", "", "", startsAt, endsAt, "[]", encryptedBlob, keyVersion, t, t).run();
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
  const encryptedBlob = String(body.encrypted_blob || "").trim();
  if (!encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const startsAt = body.starts_at === undefined ? null : Number(body.starts_at);
  const endsAt = body.ends_at === undefined ? null : Number(body.ends_at);
  const keyVersion = await getOrgCryptoKeyVersion(env.BF_DB, orgId);
  await env.BF_DB.prepare(
    `UPDATE events
     SET title = '__encrypted__', description = '', location = '', tags_json = '[]',
         starts_at = COALESCE(?, starts_at), ends_at = COALESCE(?, ends_at),
         encrypted_blob = ?, key_version = ?, updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(
    Number.isFinite(startsAt) ? startsAt : null,
    Number.isFinite(endsAt) ? endsAt : null,
    encryptedBlob,
    keyVersion,
    now(),
    id,
    orgId
  ).run();
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
