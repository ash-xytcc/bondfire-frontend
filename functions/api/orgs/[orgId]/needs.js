import { json, bad, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { logActivity } from "../../_lib/activity.js";
import { getOrgKeyVersion } from "../../_lib/zk.js";

function asString(v) {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function asBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = asString(v).trim().toLowerCase();
  if (!s) return fallback;
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return fallback;
}

function parsePriority(v, fallback = 0) {
  if (v == null || v === "") return fallback;
  if (typeof v === "number") return Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : fallback;
  const s = asString(v).trim().toLowerCase();
  if (!s) return fallback;
  const n = Number(s);
  if (Number.isFinite(n)) return Math.max(0, Math.trunc(n));
  if (["high", "urgent", "h"].includes(s)) return 3;
  if (["medium", "med", "m"].includes(s)) return 2;
  if (["low", "l"].includes(s)) return 1;
  return fallback;
}

function hasCiphertext(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function ensureNeedsZkColumns(db) {
  try { await db.prepare("ALTER TABLE needs ADD COLUMN encrypted_description TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE needs ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE needs ADD COLUMN key_version INTEGER").run(); } catch {}
}

async function scrubEncryptedPlaintext(db, orgId) {
  await db.prepare(
    `UPDATE needs
     SET title = '', description = '', encrypted_description = NULL
     WHERE org_id = ? AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''`
  ).bind(orgId).run();
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensureNeedsZkColumns(env.BF_DB);
  await scrubEncryptedPlaintext(env.BF_DB, orgId);

  const r = await env.BF_DB.prepare(
    `SELECT id, title, description, status, priority,
       CASE WHEN priority >= 3 THEN 'high' WHEN priority = 2 THEN 'medium' WHEN priority = 1 THEN 'low' ELSE '' END AS urgency,
       is_public, encrypted_description, encrypted_blob, key_version, created_at, updated_at
     FROM needs
     WHERE org_id = ?
     ORDER BY COALESCE(updated_at, created_at) DESC`
  ).bind(orgId).all();

  return json({ ok: true, needs: r?.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensureNeedsZkColumns(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const isPublic = asBool(body.is_public, false);
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : null;
  if (!isPublic && !encryptedBlob) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const title = isPublic ? asString(body.title).trim() : "";
  if (isPublic && !title) return bad(400, "Title is required");
  const description = isPublic ? asString(body.description).trim() : "";
  const status = asString(body.status).trim() || "open";
  const priority = parsePriority(body.priority ?? body.urgency, 0);
  const id = uuid();
  const t = now();
  const keyVersion = encryptedBlob ? await getOrgKeyVersion(env.BF_DB, orgId) : null;

  await env.BF_DB.prepare(
    `INSERT INTO needs (id, org_id, title, description, status, priority, is_public, encrypted_description, encrypted_blob, key_version, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, orgId, title, description, status, priority, isPublic ? 1 : 0, null, encryptedBlob, keyVersion, t, t).run();

  logActivity(env, {
    orgId,
    kind: "need.created",
    message: isPublic ? `Public need created: ${title}` : `Encrypted need created: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "need",
    entityId: id,
    entityTitle: isPublic ? title : "",
  }).catch(() => {});

  return json({ ok: true, id });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  await ensureNeedsZkColumns(env.BF_DB);

  const body = await request.json().catch(() => ({}));
  const id = asString(body.id).trim();
  if (!id) return bad(400, "id is required");

  const existing = await env.BF_DB.prepare(
    `SELECT id, title, description, status, priority, is_public, encrypted_blob, key_version
     FROM needs WHERE org_id = ? AND id = ?`
  ).bind(orgId, id).first();
  if (!existing) return bad(404, "Need not found");

  const isPublic = body.is_public === undefined ? !!existing.is_public : asBool(body.is_public, false);
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : existing.encrypted_blob;
  if (!isPublic && !hasCiphertext(encryptedBlob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const title = isPublic
    ? (body.title === undefined ? existing.title : asString(body.title).trim())
    : "";
  if (isPublic && !title) return bad(400, "Title is required");
  const description = isPublic
    ? (body.description === undefined ? existing.description : asString(body.description).trim())
    : "";
  const status = body.status === undefined ? existing.status : asString(body.status).trim();
  const basePriority = Number.isFinite(Number(existing.priority)) ? Math.max(0, Math.trunc(Number(existing.priority))) : 0;
  const priority = body.priority === undefined && body.urgency === undefined
    ? basePriority
    : parsePriority(body.priority ?? body.urgency, basePriority);
  const keyVersion = hasCiphertext(body.encrypted_blob) ? await getOrgKeyVersion(env.BF_DB, orgId) : existing.key_version;

  await env.BF_DB.prepare(
    `UPDATE needs
     SET title = ?, description = ?, status = ?, priority = ?, is_public = ?,
         encrypted_description = NULL, encrypted_blob = ?, key_version = ?, updated_at = ?
     WHERE org_id = ? AND id = ?`
  ).bind(title, description, status, priority, isPublic ? 1 : 0, encryptedBlob || null, keyVersion || null, now(), orgId, id).run();

  logActivity(env, {
    orgId,
    kind: "need.updated",
    message: isPublic ? `Public need updated: ${title}` : `Encrypted need updated: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "need",
    entityId: id,
    entityTitle: isPublic ? title : "",
  }).catch(() => {});

  return json({ ok: true });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;

  const url = new URL(request.url);
  let id = url.searchParams.get("id");
  if (!id) {
    const body = await request.json().catch(() => ({}));
    id = asString(body.id).trim();
  }
  id = asString(id).trim();
  if (!id) return bad(400, "id is required");

  await env.BF_DB.prepare("DELETE FROM needs WHERE org_id = ? AND id = ?").bind(orgId, id).run();

  logActivity(env, {
    orgId,
    kind: "need.deleted",
    message: `Need deleted: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "need",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true });
}
