import { json, bad, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { logActivity } from "../../_lib/activity.js";
import { getOrgKeyVersion } from "../../_lib/zk.js";

async function ensureMeetingsZkColumns(db) {
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_notes TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN key_version INTEGER").run(); } catch {}
}

async function ensureMeetingsPublicColumn(db) {
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0").run(); } catch {}
}

function hasCiphertext(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function scrubEncryptedPlaintext(db, orgId) {
  await db.prepare(
    `UPDATE meetings
     SET title = '', location = '', agenda = '', notes = '', encrypted_notes = NULL
     WHERE org_id = ? AND is_public = 0 AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''`
  ).bind(orgId).run();
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;

  await ensureMeetingsPublicColumn(env.BF_DB);
  await ensureMeetingsZkColumns(env.BF_DB);
  await scrubEncryptedPlaintext(env.BF_DB, orgId);

  const res = await env.BF_DB.prepare(
    `SELECT id, title, starts_at, ends_at, location, agenda, notes, is_public,
            encrypted_notes, encrypted_blob, key_version, created_at, updated_at
     FROM meetings WHERE org_id = ? ORDER BY starts_at DESC, created_at DESC`
  ).bind(orgId).all();

  return json({ ok: true, meetings: res.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  await ensureMeetingsPublicColumn(env.BF_DB);
  await ensureMeetingsZkColumns(env.BF_DB);
  const body = await request.json().catch(() => ({}));
  const isPublic = !!body.is_public;
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : null;
  if (!isPublic && !encryptedBlob) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const title = isPublic ? String(body.title || "").trim() : "";
  if (isPublic && !title) return bad(400, "MISSING_TITLE");

  const id = uuid();
  const t = now();
  const startsAt = Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : t;
  const endsAt = Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : startsAt;
  const keyVersion = encryptedBlob ? await getOrgKeyVersion(env.BF_DB, orgId) : null;

  await env.BF_DB.prepare(
    `INSERT INTO meetings (
      id, org_id, title, starts_at, ends_at, location, agenda, notes, is_public,
      encrypted_notes, encrypted_blob, key_version, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, orgId, title, startsAt, endsAt,
    isPublic ? String(body.location || "") : "",
    isPublic ? String(body.agenda || "") : "",
    isPublic ? String(body.notes || "") : "",
    isPublic ? 1 : 0,
    null, encryptedBlob, keyVersion, t, t
  ).run();

  logActivity(env, {
    orgId,
    kind: "meeting.created",
    message: isPublic ? `Public meeting created: ${title}` : `Encrypted meeting created: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "meeting",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true, id });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  await ensureMeetingsPublicColumn(env.BF_DB);
  await ensureMeetingsZkColumns(env.BF_DB);
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  const existing = await env.BF_DB.prepare(
    `SELECT id, title, starts_at, ends_at, location, agenda, notes, is_public, encrypted_blob, key_version
     FROM meetings WHERE id = ? AND org_id = ?`
  ).bind(id, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");

  const isPublic = body.is_public === undefined ? !!existing.is_public : !!body.is_public;
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : existing.encrypted_blob;
  if (!isPublic && !hasCiphertext(encryptedBlob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const startsAt = body.starts_at === undefined || body.starts_at === null
    ? existing.starts_at
    : (Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : existing.starts_at);
  const endsAt = body.ends_at === undefined || body.ends_at === null
    ? existing.ends_at
    : (Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : existing.ends_at);
  const title = isPublic ? (body.title === undefined ? String(existing.title || "") : String(body.title || "").trim()) : "";
  if (isPublic && !title) return bad(400, "MISSING_TITLE");
  const location = isPublic ? (body.location === undefined ? String(existing.location || "") : String(body.location || "")) : "";
  const agenda = isPublic ? (body.agenda === undefined ? String(existing.agenda || "") : String(body.agenda || "")) : "";
  const notes = isPublic ? (body.notes === undefined ? String(existing.notes || "") : String(body.notes || "")) : "";
  const keyVersion = hasCiphertext(body.encrypted_blob) ? await getOrgKeyVersion(env.BF_DB, orgId) : existing.key_version;

  await env.BF_DB.prepare(
    `UPDATE meetings
     SET title = ?, starts_at = ?, ends_at = ?, location = ?, agenda = ?, notes = ?, is_public = ?,
         encrypted_notes = NULL, encrypted_blob = ?, key_version = ?, updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(title, startsAt, endsAt, location, agenda, notes, isPublic ? 1 : 0, encryptedBlob || null, keyVersion || null, now(), id, orgId).run();

  logActivity(env, {
    orgId,
    kind: "meeting.updated",
    message: isPublic ? `Public meeting updated: ${title}` : `Encrypted meeting updated: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "meeting",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;

  const url = new URL(request.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  await env.BF_DB.prepare("DELETE FROM meetings WHERE id = ? AND org_id = ?").bind(id, orgId).run();

  logActivity(env, {
    orgId,
    kind: "meeting.deleted",
    message: `Meeting deleted: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "meeting",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true });
}
