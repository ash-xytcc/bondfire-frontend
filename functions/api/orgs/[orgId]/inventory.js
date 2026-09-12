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
async function ensureInventoryParsTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS inventory_pars (
    org_id TEXT NOT NULL, inventory_id TEXT NOT NULL, par REAL, updated_at INTEGER,
    PRIMARY KEY (org_id, inventory_id)
  )`).run();
}
function inventoryForClient(row) {
  if (!row || row.is_public || !row.encrypted_blob) return row;
  return { ...row, name: "", category: "", location: "", notes: "", encrypted_notes: null };
}
async function getItem(db, orgId, id) {
  const row = await db.prepare(
    `SELECT i.id, i.org_id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version, i.is_public, i.created_at, i.updated_at, ip.par
     FROM inventory i LEFT JOIN inventory_pars ip ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.id = ? AND i.org_id = ?`
  ).bind(id, orgId).first();
  return inventoryForClient(row);
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;
  await ensureInventoryParsTable(env.BF_DB);
  const res = await env.BF_DB.prepare(
    `SELECT i.id, i.name, i.qty, i.unit, i.category, i.location, i.notes,
            i.encrypted_notes, i.encrypted_blob, i.key_version, i.is_public, i.created_at, i.updated_at, ip.par
     FROM inventory i LEFT JOIN inventory_pars ip ON ip.org_id = i.org_id AND ip.inventory_id = i.id
     WHERE i.org_id = ? ORDER BY i.created_at DESC`
  ).bind(orgId).all();
  return json({ ok: true, inventory: (res.results || []).map(inventoryForClient) });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  await ensureInventoryParsTable(env.BF_DB);
  const isPublic = body.is_public ? 1 : 0;
  const encryptedBlob = String(body.encrypted_blob || "").trim();
  if (!isPublic && !encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const publicName = String(body.name || "").trim();
  if (isPublic && !publicName) return bad(400, "MISSING_NAME");
  const id = uuid();
  const t = now();
  const qty = Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0;
  const keyVersion = encryptedBlob ? await getOrgCryptoKeyVersion(env.BF_DB, orgId) : null;
  await env.BF_DB.prepare(
    `INSERT INTO inventory (id, org_id, name, qty, unit, category, location, notes, encrypted_notes, encrypted_blob, key_version, is_public, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, orgId,
    isPublic ? publicName : "__encrypted__",
    qty,
    String(body.unit || ""),
    isPublic ? String(body.category || "") : "",
    isPublic ? String(body.location || "") : "",
    isPublic ? String(body.notes || "") : "",
    null,
    isPublic ? null : encryptedBlob,
    isPublic ? null : keyVersion,
    isPublic,
    t,
    t
  ).run();
  const par = body.par === undefined || body.par === null || body.par === "" ? null : Number(body.par);
  if (Number.isFinite(par) && par > 0) {
    await env.BF_DB.prepare(
      `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(org_id, inventory_id) DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
    ).bind(orgId, id, par, t).run();
  }
  logActivity(env, {
    orgId,
    kind: "inventory.created",
    message: isPublic ? `inventory added: ${publicName}` : "encrypted inventory record created",
    actorUserId: a?.user?.sub || null,
    entityType: "inventory",
    entityId: id,
    entityTitle: isPublic ? publicName : "",
  }).catch(() => {});
  return json({ ok: true, id, item: await getItem(env.BF_DB, orgId, id) });
}

export async function onRequestPut({ env, request, params }) {
  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return bad(400, "MISSING_ID");
  await ensureInventoryParsTable(env.BF_DB);
  const existing = await env.BF_DB.prepare("SELECT * FROM inventory WHERE id = ? AND org_id = ?").bind(id, orgId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const nextPublic = typeof body.is_public === "boolean" ? (body.is_public ? 1 : 0) : Number(existing.is_public || 0);
  const encryptedBlob = String(body.encrypted_blob || "").trim();
  if (!nextPublic && !encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const qty = body.qty === undefined || body.qty === null ? Number(existing.qty || 0) : (Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0);
  const unit = body.unit === undefined ? String(existing.unit || "") : String(body.unit || "");
  let name, category, location, notes, blob, keyVersion;
  if (nextPublic) {
    name = body.name === undefined ? (existing.is_public ? existing.name : "") : String(body.name || "").trim();
    if (!name) return bad(400, "MISSING_NAME");
    category = body.category === undefined ? (existing.is_public ? existing.category : "") : String(body.category || "");
    location = body.location === undefined ? (existing.is_public ? existing.location : "") : String(body.location || "");
    notes = body.notes === undefined ? (existing.is_public ? existing.notes : "") : String(body.notes || "");
    blob = null;
    keyVersion = null;
  } else {
    name = "__encrypted__";
    category = "";
    location = "";
    notes = "";
    blob = encryptedBlob;
    keyVersion = await getOrgCryptoKeyVersion(env.BF_DB, orgId);
  }
  await env.BF_DB.prepare(
    `UPDATE inventory SET name = ?, qty = ?, unit = ?, category = ?, location = ?, notes = ?, encrypted_notes = NULL,
       encrypted_blob = ?, key_version = ?, is_public = ?, updated_at = ? WHERE id = ? AND org_id = ?`
  ).bind(name, qty, unit, category, location, notes, blob, keyVersion, nextPublic, now(), id, orgId).run();
  if (Object.prototype.hasOwnProperty.call(body, "par")) {
    const parRaw = body.par;
    const par = parRaw === undefined || parRaw === null || parRaw === "" ? null : Number(parRaw);
    if (Number.isFinite(par) && par > 0) {
      await env.BF_DB.prepare(
        `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(org_id, inventory_id) DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
      ).bind(orgId, id, par, now()).run();
    } else {
      await env.BF_DB.prepare(`DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?`).bind(orgId, id).run();
    }
  }
  logActivity(env, {
    orgId,
    kind: "inventory.updated",
    message: nextPublic ? `inventory updated: ${name}` : "encrypted inventory record updated",
    actorUserId: a?.user?.sub || null,
    entityType: "inventory",
    entityId: id,
    entityTitle: nextPublic ? name : "",
  }).catch(() => {});
  return json({ ok: true, item: await getItem(env.BF_DB, orgId, id) });
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
    message: "inventory record deleted",
    actorUserId: a?.user?.sub || a?.user?.id || null,
    entityType: "inventory",
    entityId: id,
    entityTitle: "",
  }).catch(() => {});
  return json({ ok: true });
}
