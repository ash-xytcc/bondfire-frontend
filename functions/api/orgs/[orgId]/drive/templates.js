import { bad } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";
import { ensureDriveSchema, getDb, created, json, now, uuid } from "../../../_lib/drive.js";

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  const res = await getDb(env).prepare(`SELECT id, name, title, content, encrypted_blob, created_at, updated_at FROM drive_templates WHERE org_id = ? ORDER BY updated_at DESC`).bind(orgId).all();
  return json({ ok: true, templates: (res.results || []).map((row) => ({ id: row.id, name: row.encrypted_blob ? "encrypted template" : row.name || "template", title: row.encrypted_blob ? "encrypted template" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })) });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  const body = await request.json().catch(() => ({}));
  const encryptedBlob = String(body.encryptedBlob || "").trim();
  if (!encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const id = uuid();
  const t = now();
  const template = { id, name: "encrypted template", title: "encrypted template", body: "", encryptedBlob, createdAt: t, updatedAt: t };
  await getDb(env).prepare(`INSERT INTO drive_templates (id, org_id, name, title, content, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, orgId, "encrypted template", "encrypted template", "", encryptedBlob, t, t).run();
  return created("template", template);
}
