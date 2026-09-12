import { bad } from "../../../_lib/http.js";
import { requireOrgRole } from "../../../_lib/auth.js";
import { ensureDriveSchema, getDb, getDriveBucket, normalizeNullableId, created, json, now, uuid, saveFileBlob, getFileRecord } from "../../../_lib/drive.js";

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env);
  const res = await getDb(env).prepare(`SELECT id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at FROM drive_files WHERE org_id = ? ORDER BY LOWER(name) ASC`).bind(orgId).all();
  return json({ ok: true, files: (res.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, name: row.encrypted_blob ? "encrypted file" : row.name || "file", mime: row.encrypted_blob ? "application/octet-stream" : row.mime || "application/octet-stream", size: Number(row.size || 0), encrypted: Number(row.encrypted || 0) === 1, encryptedBlob: row.encrypted_blob || "", storageKey: row.storage_key || null, createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })) });
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;
  await ensureDriveSchema(env);

  const db = getDb(env);
  const id = uuid();
  const t = now();
  const bucket = getDriveBucket(env);
  const headerName = String(request.headers.get("x-drive-name") || "").trim();

  if (headerName) {
    const encrypted = String(request.headers.get("x-drive-encrypted") || "") === "1";
    const encryptedBlob = String(request.headers.get("x-drive-encrypted-blob") || "").trim();
    if (!encrypted || !encryptedBlob) return bad(400, "ENCRYPTED_FILE_REQUIRED");
    const parentId = normalizeNullableId(request.headers.get("x-drive-parent-id"));
    const encryptedPayload = new TextDecoder().decode(new Uint8Array(await request.arrayBuffer()));
    if (!encryptedPayload) return bad(400, "ENCRYPTED_PAYLOAD_REQUIRED");
    const storageKey = `${orgId}/drive/files/${id}`;
    await saveFileBlob(env, { orgId, fileId: id, storageKey, mime: "application/octet-stream", encryptedPayload, encrypted: true });
    await db.prepare(`INSERT INTO drive_files (id, org_id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`).bind(id, orgId, parentId, "encrypted file", "application/octet-stream", encryptedPayload.length, storageKey, encryptedBlob, t, t).run();
    const createdFile = await getFileRecord(env, orgId, id, { includeData: false });
    return created("file", createdFile);
  }

  const contentType = String(request.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("multipart/form-data")) return bad(400, "ENCRYPTED_FILE_REQUIRED");

  const body = await request.json().catch(() => ({}));
  const encryptedBlob = String(body.encryptedBlob || "").trim();
  const encryptedPayload = String(body.encryptedPayload || "");
  if (!encryptedBlob || !encryptedPayload) return bad(400, "ENCRYPTED_FILE_REQUIRED");
  const storageKey = `${orgId}/drive/files/${id}`;
  const parentId = normalizeNullableId(body.parentId);
  await db.prepare(`INSERT INTO drive_files (id, org_id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`).bind(id, orgId, parentId, "encrypted file", "application/octet-stream", Number(body.size || encryptedPayload.length || 0), storageKey, encryptedBlob, t, t).run();
  await saveFileBlob(env, { orgId, fileId: id, storageKey, mime: "application/octet-stream", encryptedPayload, encrypted: true });
  const createdFile = await getFileRecord(env, orgId, id, { includeData: false });
  return created("file", createdFile);
}
