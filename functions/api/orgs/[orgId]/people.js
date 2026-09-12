import { json, bad, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { logActivity } from "../../_lib/activity.js";
import { getOrgKeyVersion } from "../../_lib/zk.js";

async function ensurePeopleZkColumns(db) {
  try { await db.prepare("ALTER TABLE people ADD COLUMN encrypted_notes TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE people ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE people ADD COLUMN key_version INTEGER").run(); } catch {}
}

function hasCiphertext(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensurePeopleZkColumns(env.BF_DB);

  const res = await env.BF_DB.prepare(
    "SELECT id, name, role, phone, skills, notes, encrypted_notes, encrypted_blob, key_version, created_at, updated_at FROM people WHERE org_id = ? ORDER BY created_at DESC"
  ).bind(orgId).all();

  return json({ ok: true, people: res.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensurePeopleZkColumns(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  if (!hasCiphertext(body.encrypted_blob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const id = uuid();
  const t = now();
  const keyVersion = await getOrgKeyVersion(env.BF_DB, orgId);

  await env.BF_DB.prepare(
    `INSERT INTO people (id, org_id, name, role, phone, skills, notes, encrypted_notes, encrypted_blob, key_version, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    orgId,
    "",
    "",
    "",
    "",
    "",
    null,
    body.encrypted_blob,
    keyVersion,
    t,
    t
  ).run();

  logActivity(env, {
    orgId,
    kind: "person.created",
    message: `Encrypted person record created: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "person",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true, id });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensurePeopleZkColumns(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  const existing = await env.BF_DB.prepare(
    "SELECT encrypted_blob FROM people WHERE id = ? AND org_id = ?"
  ).bind(id, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");

  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : existing.encrypted_blob;
  if (!hasCiphertext(encryptedBlob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");
  const keyVersion = hasCiphertext(body.encrypted_blob) ? await getOrgKeyVersion(env.BF_DB, orgId) : null;

  await env.BF_DB.prepare(
    `UPDATE people
     SET name = '',
         role = '',
         phone = '',
         skills = '',
         notes = '',
         encrypted_notes = NULL,
         encrypted_blob = ?,
         key_version = COALESCE(?, key_version),
         updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(encryptedBlob, keyVersion, now(), id, orgId).run();

  logActivity(env, {
    orgId,
    kind: "person.updated",
    message: `Encrypted person record updated: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "person",
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

  await env.BF_DB.prepare("DELETE FROM people WHERE id = ? AND org_id = ?").bind(id, orgId).run();

  logActivity(env, {
    orgId,
    kind: "person.deleted",
    message: `Encrypted person record deleted: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "person",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true });
}
