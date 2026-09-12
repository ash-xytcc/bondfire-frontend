import { json, bad, now, uuid } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { logActivity } from "../../_lib/activity.js";
import { getOrgKeyVersion } from "../../_lib/zk.js";

async function ensureInventoryParsTable(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS inventory_pars (
      org_id TEXT NOT NULL,
      inventory_id TEXT NOT NULL,
      par REAL,
      updated_at INTEGER,
      PRIMARY KEY (org_id, inventory_id)
    )`
  ).run();
}

function hasCiphertext(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function scrubEncryptedPlaintext(db, orgId) {
  await db.prepare(
    `UPDATE inventory
     SET name = '', category = '', location = '', notes = '', encrypted_notes = NULL
     WHERE org_id = ? AND is_public = 0 AND encrypted_blob IS NOT NULL AND encrypted_blob <> ''`
  ).bind(orgId).run();
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;

  await ensureInventoryParsTable(env.BF_DB);
  await scrubEncryptedPlaintext(env.BF_DB, orgId);
  const res = await env.BF_DB.prepare(
    `SELECT i.id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version,
            i.is_public, i.created_at, i.updated_at, ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.org_id = ?
     ORDER BY i.created_at DESC`
  ).bind(orgId).all();

  return json({ ok: true, inventory: res.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  const body = await request.json().catch(() => ({}));
  const isPublic = !!body.is_public;
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : null;
  if (!isPublic && !encryptedBlob) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const publicName = isPublic ? String(body.name || "").trim() : "";
  if (isPublic && !publicName) return bad(400, "MISSING_NAME");

  await ensureInventoryParsTable(env.BF_DB);
  const id = uuid();
  const t = now();
  const qty = Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0;
  const keyVersion = encryptedBlob ? await getOrgKeyVersion(env.BF_DB, orgId) : null;

  await env.BF_DB.prepare(
    `INSERT INTO inventory (
      id, org_id, name, qty, unit, category, location, notes,
      encrypted_notes, encrypted_blob, key_version, is_public, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    orgId,
    publicName,
    qty,
    String(body.unit || ""),
    isPublic ? String(body.category || "") : "",
    isPublic ? String(body.location || "") : "",
    isPublic ? String(body.notes || "") : "",
    null,
    encryptedBlob,
    keyVersion,
    isPublic ? 1 : 0,
    t,
    t
  ).run();

  const par = body.par === undefined || body.par === null || body.par === "" ? null : Number(body.par);
  if (Number.isFinite(par) && par > 0) {
    await env.BF_DB.prepare(
      `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(org_id, inventory_id) DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
    ).bind(orgId, id, par, t).run();
  }

  logActivity(env, {
    orgId,
    kind: "inventory.created",
    message: isPublic ? `Public inventory item created: ${publicName}` : `Encrypted inventory item created: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "inventory",
    entityId: id,
  }).catch(() => {});

  const created = await env.BF_DB.prepare(
    `SELECT i.id, i.org_id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version, i.is_public,
            i.created_at, i.updated_at, ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.id = ? AND i.org_id = ?`
  ).bind(id, orgId).first();

  return json({ ok: true, id, item: created || null });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  await ensureInventoryParsTable(env.BF_DB);
  const existing = await env.BF_DB.prepare(
    `SELECT id, name, qty, unit, category, location, notes, encrypted_blob, key_version, is_public
     FROM inventory WHERE id = ? AND org_id = ?`
  ).bind(id, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");

  const isPublic = body.is_public === undefined ? !!existing.is_public : !!body.is_public;
  const encryptedBlob = hasCiphertext(body.encrypted_blob) ? body.encrypted_blob : existing.encrypted_blob;
  if (!isPublic && !hasCiphertext(encryptedBlob)) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");

  const qty = body.qty === undefined || body.qty === null
    ? Number(existing.qty || 0)
    : (Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0);
  const unit = body.unit === undefined ? String(existing.unit || "") : String(body.unit || "");
  const keyVersion = hasCiphertext(body.encrypted_blob) ? await getOrgKeyVersion(env.BF_DB, orgId) : existing.key_version;

  const name = isPublic ? (body.name === undefined ? String(existing.name || "") : String(body.name || "").trim()) : "";
  if (isPublic && !name) return bad(400, "MISSING_NAME");
  const category = isPublic ? (body.category === undefined ? String(existing.category || "") : String(body.category || "")) : "";
  const location = isPublic ? (body.location === undefined ? String(existing.location || "") : String(body.location || "")) : "";
  const notes = isPublic ? (body.notes === undefined ? String(existing.notes || "") : String(body.notes || "")) : "";

  await env.BF_DB.prepare(
    `UPDATE inventory
     SET name = ?, qty = ?, unit = ?, category = ?, location = ?, notes = ?,
         encrypted_notes = NULL, encrypted_blob = ?, key_version = ?, is_public = ?, updated_at = ?
     WHERE id = ? AND org_id = ?`
  ).bind(name, qty, unit, category, location, notes, encryptedBlob || null, keyVersion || null, isPublic ? 1 : 0, now(), id, orgId).run();

  if (Object.prototype.hasOwnProperty.call(body, "par")) {
    const parRaw = body.par;
    const par = parRaw === undefined || parRaw === null || parRaw === "" ? null : Number(parRaw);
    if (Number.isFinite(par) && par > 0) {
      await env.BF_DB.prepare(
        `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(org_id, inventory_id) DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
      ).bind(orgId, id, par, now()).run();
    } else {
      await env.BF_DB.prepare("DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?").bind(orgId, id).run();
    }
  }

  logActivity(env, {
    orgId,
    kind: "inventory.updated",
    message: isPublic ? `Public inventory item updated: ${name}` : `Encrypted inventory item updated: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "inventory",
    entityId: id,
  }).catch(() => {});

  const item = await env.BF_DB.prepare(
    `SELECT i.id, i.org_id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version, i.is_public,
            i.created_at, i.updated_at, ip.par
     FROM inventory i
     LEFT JOIN inventory_pars ip ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.id = ? AND i.org_id = ?`
  ).bind(id, orgId).first();

  return json({ ok: true, item: item || null });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;

  const url = new URL(request.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!id) return bad(400, "MISSING_ID");

  await ensureInventoryParsTable(env.BF_DB);
  await env.BF_DB.prepare("DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?").bind(orgId, id).run();
  await env.BF_DB.prepare("DELETE FROM inventory WHERE id = ? AND org_id = ?").bind(id, orgId).run();

  logActivity(env, {
    orgId,
    kind: "inventory.deleted",
    message: `Inventory item deleted: ${id}`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "inventory",
    entityId: id,
  }).catch(() => {});

  return json({ ok: true });
}
