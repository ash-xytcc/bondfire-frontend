import { ok, err } from "../../_lib/http.js";
import { requireOrgRole } from "../../_lib/auth.js";
import { getDB } from "../../_bf.js";

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

async function ensurePledgesTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS pledges (
    id TEXT PRIMARY KEY, org_id TEXT NOT NULL, need_id TEXT NULL,
    title TEXT NOT NULL, description TEXT NULL, qty REAL NULL, unit TEXT NULL,
    contact TEXT NULL, is_public INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pledges_org_created ON pledges(org_id, created_at DESC)`).run();
  const adds = [
    "ALTER TABLE pledges ADD COLUMN pledger_name TEXT",
    "ALTER TABLE pledges ADD COLUMN pledger_email TEXT",
    "ALTER TABLE pledges ADD COLUMN type TEXT",
    "ALTER TABLE pledges ADD COLUMN amount REAL",
    "ALTER TABLE pledges ADD COLUMN note TEXT",
    "ALTER TABLE pledges ADD COLUMN status TEXT DEFAULT 'offered'",
    "ALTER TABLE pledges ADD COLUMN encrypted_blob TEXT",
    "ALTER TABLE pledges ADD COLUMN key_version INTEGER",
  ];
  for (const sql of adds) { try { await db.prepare(sql).run(); } catch {} }
}

async function bumpNeedToInProgress(db, orgId, needId) {
  if (!needId) return;
  await db.prepare(`UPDATE needs SET status='in_progress', updated_at=? WHERE id=? AND org_id=? AND (status IS NULL OR status='open')`).bind(Date.now(), needId, orgId).run();
}
function now() { return Date.now(); }
function uuid() { return crypto.randomUUID(); }
function toStr(v, max) { const s = String(v ?? "").trim(); return max ? s.slice(0, max) : s; }
function toNumOrNull(v) { if (v == null || String(v).trim() === "") return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function boolToInt(v) { return v ? 1 : 0; }
function publicContact(name, email) { const n = toStr(name, 120); const e = toStr(email, 160); return n && e ? `${n} ${e}` : n || e || null; }

function pledgeForClient(p) {
  const isPublic = Number(p.is_public || 0) === 1;
  if (!isPublic && p.encrypted_blob) {
    return {
      id: p.id, org_id: p.org_id, need_id: p.need_id ?? null,
      pledger_name: "", pledger_email: "", type: "", amount: "", unit: "", note: "",
      status: (p.status ?? "offered") || "offered", is_public: false,
      encrypted_blob: p.encrypted_blob, key_version: p.key_version ?? null,
      created_at: p.created_at, updated_at: p.updated_at,
    };
  }
  return {
    id: p.id, org_id: p.org_id, need_id: p.need_id ?? null,
    pledger_name: (p.pledger_name ?? "") || "",
    pledger_email: (p.pledger_email ?? "") || "",
    type: (p.type ?? p.title ?? "") || "",
    amount: p.amount != null ? p.amount : p.qty != null ? p.qty : "",
    unit: p.unit ?? "",
    note: (p.note ?? p.description ?? "") || "",
    status: (p.status ?? "offered") || "offered",
    is_public: isPublic,
    encrypted_blob: p.encrypted_blob || null,
    key_version: p.key_version ?? null,
    created_at: p.created_at, updated_at: p.updated_at,
  };
}

async function listPledges(db, orgId) {
  const r = await db.prepare(`SELECT id, org_id, need_id, title, description, qty, unit, contact, is_public, created_at, updated_at, pledger_name, pledger_email, type, amount, note, status, encrypted_blob, key_version FROM pledges WHERE org_id=? ORDER BY created_at DESC`).bind(orgId).all();
  return (r.results || []).map(pledgeForClient);
}

export async function onRequest(ctx) {
  const { params, env, request } = ctx;
  const orgId = params.orgId;
  const db = getDB(env);
  if (!db) return err(500, "DB_NOT_CONFIGURED");
  await ensurePledgesTable(db);
  const gate = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!gate.ok) return gate.resp;

  try {
    if (request.method === "GET") return ok({ pledges: await listPledges(db, orgId) });

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const id = uuid();
      const t = now();
      const isPublic = boolToInt(body.is_public);
      const encryptedBlob = toStr(body.encrypted_blob);
      if (!isPublic && !encryptedBlob) return err(400, "ENCRYPTED_BLOB_REQUIRED");
      const needId = toStr(body.need_id ?? body.needId, 128) || null;
      const status = toStr(body.status, 32) || "offered";
      let fields;
      let keyVersion = null;
      if (isPublic) {
        const name = toStr(body.pledger_name ?? body.name, 120) || null;
        const email = toStr(body.pledger_email ?? body.email, 160) || null;
        const type = toStr(body.type ?? body.title, 140);
        const amount = toNumOrNull(body.amount ?? body.qty);
        const unit = toStr(body.unit, 64) || null;
        const note = toStr(body.note ?? body.description, 4000) || null;
        fields = { title: type || "", description: note, qty: amount, unit, contact: toStr(body.contact, 256) || publicContact(name, email), name, email, type: type || null, amount, note, blob: null };
      } else {
        keyVersion = await getOrgCryptoKeyVersion(db, orgId);
        fields = { title: "__encrypted__", description: null, qty: null, unit: null, contact: null, name: null, email: null, type: null, amount: null, note: null, blob: encryptedBlob };
      }
      await db.prepare(`INSERT INTO pledges(id, org_id, need_id, title, description, qty, unit, contact, is_public, created_at, updated_at, pledger_name, pledger_email, type, amount, note, status, encrypted_blob, key_version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        id, orgId, needId, fields.title, fields.description, fields.qty, fields.unit, fields.contact, isPublic, t, t,
        fields.name, fields.email, fields.type, fields.amount, fields.note, status, fields.blob, keyVersion
      ).run();
      return ok({ pledge: { id }, pledges: await listPledges(db, orgId) });
    }

    if (request.method === "PUT") {
      const body = await request.json().catch(() => ({}));
      const id = toStr(body.id, 128);
      if (!id) return err(400, "MISSING_ID");
      const existing = await db.prepare(`SELECT * FROM pledges WHERE id=? AND org_id=?`).bind(id, orgId).first();
      if (!existing) return err(404, "NOT_FOUND");
      const nextPublic = body.is_public === undefined ? Number(existing.is_public || 0) : boolToInt(body.is_public);
      const needId = (body.need_id !== undefined || body.needId !== undefined) ? (toStr(body.need_id ?? body.needId, 128) || null) : existing.need_id;
      const status = body.status !== undefined ? (toStr(body.status, 32) || "offered") : (existing.status || "offered");
      const encryptedBlob = toStr(body.encrypted_blob);
      let keyVersion = existing.key_version ?? null;
      let fields;
      if (nextPublic) {
        fields = {
          title: body.type !== undefined || body.title !== undefined ? toStr(body.type ?? body.title, 140) : (existing.type ?? existing.title ?? ""),
          description: body.note !== undefined || body.description !== undefined ? (toStr(body.note ?? body.description, 4000) || null) : (existing.note ?? existing.description),
          qty: body.amount !== undefined || body.qty !== undefined ? toNumOrNull(body.amount ?? body.qty) : (existing.amount ?? existing.qty),
          unit: body.unit !== undefined ? (toStr(body.unit, 64) || null) : existing.unit,
          name: body.pledger_name !== undefined ? (toStr(body.pledger_name, 120) || null) : existing.pledger_name,
          email: body.pledger_email !== undefined ? (toStr(body.pledger_email, 160) || null) : existing.pledger_email,
        };
        fields.contact = body.contact !== undefined ? (toStr(body.contact, 256) || null) : (existing.contact || publicContact(fields.name, fields.email));
        fields.type = fields.title || null; fields.amount = fields.qty; fields.note = fields.description; fields.blob = null; keyVersion = null;
      } else {
        if (!encryptedBlob) return err(400, "ENCRYPTED_BLOB_REQUIRED");
        keyVersion = await getOrgCryptoKeyVersion(db, orgId);
        fields = { title: "__encrypted__", description: null, qty: null, unit: null, contact: null, name: null, email: null, type: null, amount: null, note: null, blob: encryptedBlob };
      }
      await db.prepare(`UPDATE pledges SET need_id=?, title=?, description=?, qty=?, unit=?, contact=?, is_public=?, updated_at=?, pledger_name=?, pledger_email=?, type=?, amount=?, note=?, status=?, encrypted_blob=?, key_version=? WHERE id=? AND org_id=?`).bind(
        needId, fields.title, fields.description, fields.qty, fields.unit, fields.contact, nextPublic, now(), fields.name, fields.email, fields.type, fields.amount, fields.note, status, fields.blob, keyVersion, id, orgId
      ).run();
      if (String(status).toLowerCase() === "accepted") await bumpNeedToInProgress(db, orgId, needId);
      return ok({ pledges: await listPledges(db, orgId) });
    }

    if (request.method === "DELETE") {
      let id = null;
      try { id = (await request.json())?.id || null; } catch {}
      if (!id) id = new URL(request.url).searchParams.get("id");
      if (!id) return err(400, "MISSING_ID");
      await db.prepare("DELETE FROM pledges WHERE id=? AND org_id=?").bind(id, orgId).run();
      return ok({ pledges: await listPledges(db, orgId) });
    }

    return err(405, "METHOD_NOT_ALLOWED");
  } catch (e) {
    return err(500, "SERVER_ERROR", { message: String(e?.message || e) });
  }
}
