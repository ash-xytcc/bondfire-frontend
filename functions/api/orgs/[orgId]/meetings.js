import { json, bad, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { logActivity } from "../../_lib/activity.js";

async function getOrgCryptoKeyVersion(db, orgId) {
  try {
    const r = await db.prepare("SELECT key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  } catch (e) {
    const msg = String(e?.message || "");
    if (!msg.includes("no such column: key_version")) throw e;
    const r = await db.prepare("SELECT version AS key_version FROM org_crypto WHERE org_id = ?").bind(orgId).first();
    return Number(r?.key_version) || 1;
  }
}
async function ensureMeetingsZkColumns(db) {
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_notes TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN key_version INTEGER").run(); } catch {}
}
async function ensureMeetingsPublicColumn(db) {
  try { await db.prepare("ALTER TABLE meetings ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0").run(); } catch {}
}
function meetingForClient(row) {
  if (!row || row.is_public || !row.encrypted_blob) return row;
  return { ...row, title: "", location: "", agenda: "", notes: "", encrypted_notes: null };
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensureMeetingsPublicColumn(env.BF_DB);
  await ensureMeetingsZkColumns(env.BF_DB);
  const res = await env.BF_DB.prepare(
    `SELECT id, title, starts_at, ends_at, location, agenda, notes, is_public, encrypted_notes, encrypted_blob, key_version, created_at, updated_at
     FROM meetings WHERE org_id = ? ORDER BY starts_at DESC, created_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, meetings: (res.results || []).map(meetingForClient) });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  await ensureMeetingsPublicColumn(env.BF_DB);
  await ensureMeetingsZkColumns(env.BF_DB);
  const isPublic = body.is_public ? 1 : 0;
  const encryptedBlob = String(body.encrypted_blob || "").trim();
  if (!isPublic && !encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const publicTitle = String(body.title || "").trim();
  if (isPublic && !publicTitle) return bad(400, "MISSING_TITLE");
  const id = uuid();
  const t = now();
  const startsAt = Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : t;
  const endsAt = Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : startsAt;
  const keyVersion = encryptedBlob ? await getOrgCryptoKeyVersion(env.BF_DB, orgId) : null;
  await env.BF_DB.prepare(
    `INSERT INTO meetings (id, org_id, title, starts_at, ends_at, location, agenda, notes, is_public, encrypted_notes, encrypted_blob, key_version, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    orgId,
    isPublic ? publicTitle : "__encrypted__",
    startsAt,
    endsAt,
    isPublic ? String(body.location || "") : "",
    isPublic ? String(body.agenda || "") : "",
    isPublic ? String(body.notes || "") : "",
    isPublic,
    null,
    isPublic ? null : encryptedBlob,
    isPublic ? null : keyVersion,
    t,
    t
  ).run();
  logActivity(env, {
    orgId,
    kind: "meeting.created",
    message: isPublic ? `meeting created: ${publicTitle}` : "encrypted meeting created",
    actorUserId: a?.user?.sub || null,
    entityType: "meeting",
    entityId: id,
    entityTitle: isPublic ? publicTitle : "",
  }).catch(() => {});
  return json({ ok: true, id });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");
  await ensureMeetingsPublicColumn(env.BF_DB);
  await ensureMeetingsZkColumns(env.BF_DB);
  const existing = await env.BF_DB.prepare("SELECT * FROM meetings WHERE id = ? AND org_id = ?").bind(id, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const nextPublic = body.is_public === undefined ? Number(existing.is_public || 0) : (body.is_public ? 1 : 0);
  const encryptedBlob = String(body.encrypted_blob || "").trim();
  if (!nextPublic && !encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const startsAt = body.starts_at === undefined || body.starts_at === null ? existing.starts_at : (Number.isFinite(Number(body.starts_at)) ? Number(body.starts_at) : existing.starts_at);
  const endsAt = body.ends_at === undefined || body.ends_at === null ? existing.ends_at : (Number.isFinite(Number(body.ends_at)) ? Number(body.ends_at) : existing.ends_at);
  let title, location, agenda, notes, blob, keyVersion;
  if (nextPublic) {
    title = body.title === undefined ? (existing.is_public ? existing.title : "") : String(body.title || "").trim();
    if (!title) return bad(400, "MISSING_TITLE");
    location = body.location === undefined ? (existing.is_public ? existing.location : "") : String(body.location || "");
    agenda = body.agenda === undefined ? (existing.is_public ? existing.agenda : "") : String(body.agenda || "");
    notes = body.notes === undefined ? (existing.is_public ? existing.notes : "") : String(body.notes || "");
    blob = null;
    keyVersion = null;
  } else {
    title = "__encrypted__";
    location = "";
    agenda = "";
    notes = "";
    blob = encryptedBlob;
    keyVersion = await getOrgCryptoKeyVersion(env.BF_DB, orgId);
  }
  await env.BF_DB.prepare(
    `UPDATE meetings SET title = ?, starts_at = ?, ends_at = ?, location = ?, agenda = ?, notes = ?, is_public = ?,
       encrypted_notes = NULL, encrypted_blob = ?, key_version = ?, updated_at = ? WHERE id = ? AND org_id = ?`
  ).bind(title, startsAt, endsAt, location, agenda, notes, nextPublic, blob, keyVersion, now(), id, orgId).run();
  logActivity(env, {
    orgId,
    kind: "meeting.updated",
    message: nextPublic ? `meeting updated: ${title}` : "encrypted meeting updated",
    actorUserId: a?.user?.sub || null,
    entityType: "meeting",
    entityId: id,
    entityTitle: nextPublic ? title : "",
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
    message: "meeting deleted",
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "meeting",
    entityId: id,
    entityTitle: "",
  }).catch(() => {});
  return json({ ok: true });
}
