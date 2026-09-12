import { bad } from "../../../../_lib/http.js";
import { requireOrgRole } from "../../../../_lib/auth.js";
import { ensureDriveSchema, getDb, normalizeNullableId, json, now, getFileRecord, saveFileBlob, deleteFileBlob } from "../../../../_lib/drive.js";

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  const file = await getFileRecord(env, orgId, fileId, { includeData: true });
  if (!file) return bad(404, "NOT_FOUND");
  return json({ ok: true, file });
}

export async function onRequestPatch({ env, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  const db = getDb(env);
  const existing = await db.prepare(`SELECT id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  const body = await request.json().catch(() => ({}));
  const touchesContent = ["name", "mime", "size", "dataUrl", "textContent", "encryptedBlob", "encryptedPayload"].some((key) => Object.prototype.hasOwnProperty.call(body, key));
  const encryptedBlob = body.encryptedBlob === undefined ? existing.encrypted_blob || null : String(body.encryptedBlob || "").trim() || null;
  if (touchesContent && !encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  if (!existing.encrypted_blob && !encryptedBlob) return bad(400, "ENCRYPTED_BLOB_REQUIRED");
  const nextParentId = Object.prototype.hasOwnProperty.call(body, "parentId") ? normalizeNullableId(body.parentId) : existing.parent_id || null;
  const encryptedPayload = body.encryptedPayload === undefined ? null : String(body.encryptedPayload || "");
  await db.prepare(
    `UPDATE drive_files SET parent_id = ?, name = 'encrypted file', mime = 'application/octet-stream', size = ?, encrypted = 1, encrypted_blob = ?, updated_at = ? WHERE org_id = ? AND id = ?`
  ).bind(nextParentId, body.size === undefined ? Number(existing.size || 0) : Number(body.size || 0), encryptedBlob, now(), orgId, fileId).run();
  if (encryptedPayload !== null) {
    if (!encryptedPayload) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");
    await saveFileBlob(env, { orgId, fileId, storageKey: existing.storage_key, mime: "application/octet-stream", encryptedPayload, encrypted: true });
  } else if (Number(existing.encrypted || 0) !== 1 && touchesContent) {
    return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");
  }
  const file = await getFileRecord(env, orgId, fileId, { includeData: true });
  return json({ ok: true, file });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const fileId = params.id;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  const db = getDb(env);
  const existing = await db.prepare(`SELECT storage_key FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).first();
  if (!existing) return bad(404, "NOT_FOUND");
  await deleteFileBlob(env, { orgId, fileId, storageKey: existing.storage_key || null });
  await db.prepare(`DELETE FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).run();
  return json({ ok: true, deleted: true, id: fileId });
}
