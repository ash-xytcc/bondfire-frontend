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

async function ensureInventoryTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      encrypted_blob TEXT,
      key_version INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
    )
  `).run();

  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_inventory_org ON inventory(org_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_inventory_org_category ON inventory(org_id, category)`).run();

  try { await db.prepare("ALTER TABLE inventory ADD COLUMN encrypted_blob TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE inventory ADD COLUMN key_version INTEGER").run(); } catch {}
}

async function getInventoryColumns(db) {
  const res = await db.prepare(`PRAGMA table_info(inventory)`).all();
  const cols = Array.isArray(res?.results) ? res.results.map((r) => String(r.name || "").trim()) : [];
  return new Set(cols);
}

function hasCol(cols, name) {
  return cols.has(name);
}

function selectExpr(cols, name, fallback = "NULL") {
  return hasCol(cols, name) ? `i.${name}` : `${fallback}`;
}

function insertValue(body, name, fallback = null) {
  return Object.prototype.hasOwnProperty.call(body, name) ? body[name] : fallback;
}

export async function onRequestGet({ env, request, params }) {
  await ensureInventoryTable(env.BF_DB);
  await ensureInventoryParsTable(env.BF_DB);

  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!a.ok) return a.resp;

  const cols = await getInventoryColumns(env.BF_DB);

  const sql = `
    SELECT
      i.id,
      i.name,
      i.quantity AS qty,
      i.unit,
      i.category,
      ${selectExpr(cols, "location")} AS location,
      ${selectExpr(cols, "notes")} AS notes,
      ${selectExpr(cols, "encrypted_notes")} AS encrypted_notes,
      i.encrypted_blob,
      i.key_version,
      ${selectExpr(cols, "is_public", "0")} AS is_public,
      i.created_at,
      i.updated_at,
      ip.par
    FROM inventory i
    LEFT JOIN inventory_pars ip
      ON ip.org_id = i.org_id AND ip.inventory_id = i.id
    WHERE i.org_id = ?
    ORDER BY i.created_at DESC
  `;

  const res = await env.BF_DB.prepare(sql).bind(orgId).all();
  return json({ ok: true, inventory: res.results || [] });
}

export async function onRequestPost({ env, request, params }) {
  await ensureInventoryTable(env.BF_DB);
  await ensureInventoryParsTable(env.BF_DB);

  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return bad(400, "MISSING_NAME");

  const cols = await getInventoryColumns(env.BF_DB);

  const id = uuid();
  const t = now();
  const qty = Number.isFinite(Number(body.qty)) ? Number(body.qty) : 0;
  const keyVersion = body.encrypted_blob ? await getOrgCryptoKeyVersion(env.BF_DB, orgId) : null;

  const columnNames = ["id", "org_id", "name", "quantity", "unit", "category", "encrypted_blob", "key_version", "created_at", "updated_at"];
  const values = [id, orgId, name, qty, String(body.unit || ""), String(body.category || ""), body.encrypted_blob ?? null, keyVersion, t, t];

  if (hasCol(cols, "location")) {
    columnNames.push("location");
    values.push(String(insertValue(body, "location", "") || ""));
  }
  if (hasCol(cols, "notes")) {
    columnNames.push("notes");
    values.push(String(insertValue(body, "notes", "") || ""));
  }
  if (hasCol(cols, "encrypted_notes")) {
    columnNames.push("encrypted_notes");
    values.push(insertValue(body, "encrypted_notes", null) ?? null);
  }
  if (hasCol(cols, "is_public")) {
    columnNames.push("is_public");
    values.push(body.is_public ? 1 : 0);
  }

  const placeholders = columnNames.map(() => "?").join(", ");
  const sql = `INSERT INTO inventory (${columnNames.join(", ")}) VALUES (${placeholders})`;

  await env.BF_DB.prepare(sql).bind(...values).run();

  const par = body.par === undefined || body.par === null || body.par === "" ? null : Number(body.par);
  if (Number.isFinite(par) && par > 0) {
    await env.BF_DB.prepare(
      `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(org_id, inventory_id)
       DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
    ).bind(orgId, id, par, t).run();
  }

  try {
    await logActivity(env, {
      orgId,
      kind: "inventory.created",
      message: `inventory added: ${name}`,
      actorUserId: a?.user?.sub || null,
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }

  const selectSql = `
    SELECT
      i.id,
      i.org_id,
      i.name,
      i.quantity AS qty,
      i.unit,
      i.category,
      ${selectExpr(cols, "location")} AS location,
      ${selectExpr(cols, "notes")} AS notes,
      ${selectExpr(cols, "encrypted_notes")} AS encrypted_notes,
      i.encrypted_blob,
      i.key_version,
      ${selectExpr(cols, "is_public", "0")} AS is_public,
      i.created_at,
      i.updated_at,
      ip.par
    FROM inventory i
    LEFT JOIN inventory_pars ip
      ON ip.org_id = i.org_id AND ip.inventory_id = i.id
    WHERE i.id = ? AND i.org_id = ?
  `;

  const created = await env.BF_DB.prepare(selectSql).bind(id, orgId).first();
  return json({ ok: true, id, item: created || null });
}

export async function onRequestPut({ env, request, params }) {
  await ensureInventoryTable(env.BF_DB);
  await ensureInventoryParsTable(env.BF_DB);

  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!a.ok) return a.resp;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return bad(400, "MISSING_ID");

  const cols = await getInventoryColumns(env.BF_DB);

  const qty =
    body.qty === undefined || body.qty === null
      ? null
      : Number.isFinite(Number(body.qty))
        ? Number(body.qty)
        : 0;

  const keyVersion = body.encrypted_blob ? await getOrgCryptoKeyVersion(env.BF_DB, orgId) : null;

  const sets = [];
  const values = [];

  if (body.name !== undefined) {
    sets.push(`name = ?`);
    values.push(body.name);
  }
  if (qty !== null) {
    sets.push(`quantity = ?`);
    values.push(qty);
  }
  if (body.unit !== undefined) {
    sets.push(`unit = ?`);
    values.push(body.unit);
  }
  if (body.category !== undefined) {
    sets.push(`category = ?`);
    values.push(body.category);
  }
  if (hasCol(cols, "location") && body.location !== undefined) {
    sets.push(`location = ?`);
    values.push(body.location);
  }
  if (hasCol(cols, "notes") && body.notes !== undefined) {
    sets.push(`notes = ?`);
    values.push(body.notes);
  }
  if (hasCol(cols, "encrypted_notes") && body.encrypted_notes !== undefined) {
    sets.push(`encrypted_notes = ?`);
    values.push(body.encrypted_notes);
  }
  if (body.encrypted_blob !== undefined) {
    sets.push(`encrypted_blob = ?`);
    values.push(body.encrypted_blob);
  }
  if (keyVersion !== null) {
    sets.push(`key_version = ?`);
    values.push(keyVersion);
  }
  if (hasCol(cols, "is_public") && typeof body.is_public === "boolean") {
    sets.push(`is_public = ?`);
    values.push(body.is_public ? 1 : 0);
  }

  sets.push(`updated_at = ?`);
  values.push(now(), id, orgId);

  await env.BF_DB.prepare(
    `UPDATE inventory
     SET ${sets.join(", ")}
     WHERE id = ? AND org_id = ?`
  ).bind(...values).run();

  if (Object.prototype.hasOwnProperty.call(body, "par")) {
    const parRaw = body.par;
    const par = parRaw === undefined || parRaw === null || parRaw === "" ? null : Number(parRaw);
    if (Number.isFinite(par) && par > 0) {
      await env.BF_DB.prepare(
        `INSERT INTO inventory_pars (org_id, inventory_id, par, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(org_id, inventory_id)
         DO UPDATE SET par = excluded.par, updated_at = excluded.updated_at`
      ).bind(orgId, id, par, now()).run();
    } else {
      await env.BF_DB.prepare(`DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?`)
        .bind(orgId, id)
        .run();
    }
  }

  try {
    await logActivity(env, {
      orgId,
      kind: "inventory.updated",
      message: `inventory updated: ${id}`,
      actorUserId: a?.user?.sub || null,
    });
  } catch (e) {
    console.error("ACTIVITY_FAIL", e);
  }

  const selectSql = `
    SELECT
      i.id,
      i.org_id,
      i.name,
      i.quantity AS qty,
      i.unit,
      i.category,
      ${selectExpr(cols, "location")} AS location,
      ${selectExpr(cols, "notes")} AS notes,
      ${selectExpr(cols, "encrypted_notes")} AS encrypted_notes,
      i.encrypted_blob,
      i.key_version,
      ${selectExpr(cols, "is_public", "0")} AS is_public,
      i.created_at,
      i.updated_at,
      ip.par
    FROM inventory i
    LEFT JOIN inventory_pars ip
      ON ip.org_id = i.org_id AND ip.inventory_id = i.id
    WHERE i.id = ? AND i.org_id = ?
  `;

  const item = await env.BF_DB.prepare(selectSql).bind(id, orgId).first();
  return json({ ok: true, item: item || null });
}

export async function onRequestDelete({ env, request, params }) {
  await ensureInventoryParsTable(env.BF_DB);

  const orgId = params.orgId;
  const a = await requireOrgRole({ env, request, orgId, minRole: "admin" });
  if (!a.ok) return a.resp;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return bad(400, "MISSING_ID");

  const prev = await env.BF_DB.prepare(
    "SELECT name FROM inventory WHERE id = ? AND org_id = ?"
  ).bind(id, orgId).first();

  const shortId = (x) =>
    typeof x === "string" && x.length > 12 ? `${x.slice(0, 8)}…${x.slice(-4)}` : (x || "");

  const name = String(prev?.name || "").trim();
  const label = name || shortId(id);

  await env.BF_DB.prepare("DELETE FROM inventory_pars WHERE org_id = ? AND inventory_id = ?")
    .bind(orgId, id)
    .run();

  await env.BF_DB.prepare("DELETE FROM inventory WHERE id = ? AND org_id = ?")
    .bind(id, orgId)
    .run();

  logActivity(env, {
    orgId,
    kind: "inventory.deleted",
    message: `Inventory removed: ${label} (${shortId(id)})`,
    actorUserId: a?.user?.sub || a?.user?.id || null,
  }).catch(() => {});

  return json({ ok: true });
}
