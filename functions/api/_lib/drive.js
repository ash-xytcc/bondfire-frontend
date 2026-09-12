import { bad, json, now, uuid } from "./http.js";

function getDb(env) {
  return env?.BF_DB || env?.DB || env?.db || null;
}

export function getDriveBucket(env) {
  return env?.BF_DRIVE_BUCKET || env?.DRIVE_BUCKET || env?.BOND_FIRE_DRIVE_BUCKET || null;
}

async function addColumn(db, sql) {
  try { await db.prepare(sql).run(); } catch {}
}

export async function ensureDriveSchema(env) {
  const db = getDb(env);
  if (!db) throw new Error("NO_DB_BINDING");
  if (env.__bfDriveSchemaReady) return;

  const statements = [
    "CREATE TABLE IF NOT EXISTS drive_folders (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, name TEXT NOT NULL, encrypted_blob TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_folders_org_parent ON drive_folders(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_notes (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, title TEXT, content TEXT, tags TEXT, encrypted_blob TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_notes_org_parent ON drive_notes(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_files (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, name TEXT, mime TEXT, size INTEGER, storage_key TEXT, encrypted INTEGER NOT NULL DEFAULT 0, encrypted_blob TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_files_org_parent ON drive_files(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_templates (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, name TEXT, title TEXT, content TEXT, encrypted_blob TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_templates_org ON drive_templates(org_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_file_blobs (file_id TEXT PRIMARY KEY, org_id TEXT NOT NULL, mime TEXT, data_url TEXT, text_content TEXT, encrypted_payload TEXT, encrypted INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_file_blobs_org ON drive_file_blobs(org_id, updated_at)",
  ];

  for (const sql of statements) await db.prepare(sql).run();
  await addColumn(db, "ALTER TABLE drive_folders ADD COLUMN encrypted_blob TEXT");
  await addColumn(db, "ALTER TABLE drive_notes ADD COLUMN encrypted_blob TEXT");
  await addColumn(db, "ALTER TABLE drive_files ADD COLUMN encrypted INTEGER NOT NULL DEFAULT 0");
  await addColumn(db, "ALTER TABLE drive_files ADD COLUMN encrypted_blob TEXT");
  await addColumn(db, "ALTER TABLE drive_templates ADD COLUMN encrypted_blob TEXT");
  await addColumn(db, "ALTER TABLE drive_file_blobs ADD COLUMN encrypted_payload TEXT");
  await addColumn(db, "ALTER TABLE drive_file_blobs ADD COLUMN encrypted INTEGER NOT NULL DEFAULT 0");

  env.__bfDriveSchemaReady = true;
}

export function normalizeNullableId(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

export function parseTags(value) {
  if (Array.isArray(value)) return value.map((x) => String(x || "").trim()).filter(Boolean);
  return String(value || "").split(",").map((x) => x.trim()).filter(Boolean);
}

export function splitDataUrl(dataUrl) {
  const raw = String(dataUrl || "");
  const match = raw.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/i);
  if (!match) return null;
  return { mime: match[1] || "application/octet-stream", base64: match[2] || "" };
}

export function bytesFromDataUrl(dataUrl) {
  const parts = splitDataUrl(dataUrl);
  if (!parts) return null;
  const bin = atob(parts.base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return { mime: parts.mime, bytes };
}

export function dataUrlFromBytes(bytes, mime) {
  let bin = "";
  const chunk = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  for (let i = 0; i < chunk.length; i += 1) bin += String.fromCharCode(chunk[i]);
  return `data:${String(mime || "application/octet-stream")};base64,${btoa(bin)}`;
}

export function textFromBytes(bytes) {
  try { return new TextDecoder().decode(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || [])); }
  catch { return ""; }
}

export function isEditableTextMime(mime, name = "") {
  const safeMime = String(mime || "").toLowerCase();
  const safeName = String(name || "").toLowerCase();
  if (safeMime.startsWith("text/")) return true;
  return [".md", ".markdown", ".txt", ".json", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".xml", ".yaml", ".yml", ".csv", ".bfsheet", ".bfform"].some((ext) => safeName.endsWith(ext)) || safeMime === "application/vnd.bondfire.sheet+json" || safeMime === "application/vnd.bondfire.form+json" || safeMime === "application/vnd.bondfire.zk-file";
}

export function buildDriveFileUrls(orgId, fileId) {
  const encodedOrgId = encodeURIComponent(String(orgId || ""));
  const encodedFileId = encodeURIComponent(String(fileId || ""));
  const base = `/api/orgs/${encodedOrgId}/drive/files/${encodedFileId}/download`;
  return { previewUrl: base, downloadUrl: `${base}?download=1`, url: base };
}

export async function listDriveTree(env, orgId) {
  await ensureDriveSchema(env);
  const db = getDb(env);
  const [foldersRes, notesRes, filesRes, templatesRes] = await Promise.all([
    db.prepare(`SELECT id, parent_id, name, encrypted_blob, created_at, updated_at FROM drive_folders WHERE org_id = ? ORDER BY LOWER(name) ASC, created_at ASC`).bind(orgId).all(),
    db.prepare(`SELECT id, parent_id, title, content, tags, encrypted_blob, created_at, updated_at FROM drive_notes WHERE org_id = ? ORDER BY updated_at DESC, created_at DESC`).bind(orgId).all(),
    db.prepare(`SELECT id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at FROM drive_files WHERE org_id = ? ORDER BY LOWER(name) ASC, created_at ASC`).bind(orgId).all(),
    db.prepare(`SELECT id, name, title, content, encrypted_blob, created_at, updated_at FROM drive_templates WHERE org_id = ? ORDER BY updated_at DESC, created_at DESC`).bind(orgId).all(),
  ]);

  return {
    folders: (foldersRes.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, name: row.encrypted_blob ? "encrypted folder" : row.name || "untitled folder", encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })),
    notes: (notesRes.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, title: row.encrypted_blob ? "encrypted note" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", tags: row.encrypted_blob ? [] : parseTags(row.tags), encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })),
    files: (filesRes.results || []).map((row) => ({ id: row.id, parentId: row.parent_id || null, name: row.encrypted_blob ? "encrypted file" : row.name || "file", mime: row.encrypted_blob ? "application/octet-stream" : row.mime || "application/octet-stream", size: Number(row.size || 0), storageKey: row.storage_key || null, encrypted: Number(row.encrypted || 0) === 1, encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0), ...buildDriveFileUrls(orgId, row.id) })),
    templates: (templatesRes.results || []).map((row) => ({ id: row.id, name: row.encrypted_blob ? "encrypted template" : row.name || "template", title: row.encrypted_blob ? "encrypted template" : row.title || "untitled", body: row.encrypted_blob ? "" : row.content || "", encryptedBlob: row.encrypted_blob || "", createdAt: Number(row.created_at || 0), updatedAt: Number(row.updated_at || 0) })),
  };
}

export async function getFileRecord(env, orgId, fileId, { includeData = false } = {}) {
  await ensureDriveSchema(env);
  const db = getDb(env);
  const row = await db.prepare(
    `SELECT id, parent_id, name, mime, size, storage_key, encrypted, encrypted_blob, created_at, updated_at FROM drive_files WHERE org_id = ? AND id = ?`
  ).bind(orgId, fileId).first();
  if (!row) return null;
  const encrypted = Number(row.encrypted || 0) === 1 || !!row.encrypted_blob;
  const file = {
    id: row.id,
    parentId: row.parent_id || null,
    name: encrypted ? "encrypted file" : row.name || "file",
    mime: encrypted ? "application/octet-stream" : row.mime || "application/octet-stream",
    size: Number(row.size || 0),
    storageKey: row.storage_key || null,
    encrypted,
    encryptedBlob: row.encrypted_blob || "",
    createdAt: Number(row.created_at || 0),
    updatedAt: Number(row.updated_at || 0),
    ...buildDriveFileUrls(orgId, row.id),
  };
  if (!includeData) return file;
  const blob = await loadFileBlob(env, orgId, row.id, row.storage_key, row.mime, row.name);
  return {
    ...file,
    dataUrl: encrypted ? "" : blob?.dataUrl || "",
    textContent: encrypted ? "" : blob?.textContent || "",
    encryptedPayload: encrypted ? blob?.encryptedPayload || "" : "",
  };
}

export async function loadFileBlob(env, orgId, fileId, storageKey, mime, name = "") {
  await ensureDriveSchema(env);
  const db = getDb(env);
  const meta = await db.prepare(`SELECT encrypted FROM drive_files WHERE org_id = ? AND id = ?`).bind(orgId, fileId).first();
  const encrypted = Number(meta?.encrypted || 0) === 1;
  const bucket = getDriveBucket(env);
  if (bucket && storageKey) {
    const obj = await bucket.get(storageKey);
    if (obj) {
      const arr = new Uint8Array(await obj.arrayBuffer());
      if (encrypted) return { encrypted: true, encryptedPayload: textFromBytes(arr), mime: "application/octet-stream" };
      const effectiveMime = mime || obj.httpMetadata?.contentType || "application/octet-stream";
      return { dataUrl: dataUrlFromBytes(arr, effectiveMime), textContent: isEditableTextMime(effectiveMime, name) ? textFromBytes(arr) : "", mime: effectiveMime };
    }
  }
  const row = await db.prepare(`SELECT data_url, text_content, mime, encrypted_payload, encrypted FROM drive_file_blobs WHERE org_id = ? AND file_id = ?`).bind(orgId, fileId).first();
  if (!row) return null;
  if (Number(row.encrypted || 0) === 1 || row.encrypted_payload) return { encrypted: true, encryptedPayload: row.encrypted_payload || "", mime: "application/octet-stream" };
  return { dataUrl: row.data_url || "", textContent: row.text_content || "", mime: row.mime || mime || "application/octet-stream" };
}

export async function saveFileBlob(env, { orgId, fileId, storageKey, mime, dataUrl, textContent, encryptedPayload = "", encrypted = false }) {
  await ensureDriveSchema(env);
  const bucket = getDriveBucket(env);
  const db = getDb(env);
  const t = now();
  if (encrypted) {
    const payload = new TextEncoder().encode(String(encryptedPayload || ""));
    if (!payload.byteLength) throw new Error("ENCRYPTED_PAYLOAD_REQUIRED");
    if (bucket && storageKey) {
      await bucket.put(storageKey, payload, { httpMetadata: { contentType: "application/octet-stream" } });
      await db.prepare(`DELETE FROM drive_file_blobs WHERE org_id = ? AND file_id = ?`).bind(orgId, fileId).run();
      return;
    }
    await db.prepare(
      `INSERT INTO drive_file_blobs (file_id, org_id, mime, data_url, text_content, encrypted_payload, encrypted, created_at, updated_at)
       VALUES (?, ?, ?, '', '', ?, 1, ?, ?)
       ON CONFLICT(file_id) DO UPDATE SET mime = excluded.mime, data_url = '', text_content = '', encrypted_payload = excluded.encrypted_payload, encrypted = 1, updated_at = excluded.updated_at`
    ).bind(fileId, orgId, "application/octet-stream", String(encryptedPayload || ""), t, t).run();
    return;
  }
  if (bucket && storageKey) {
    const payload = bytesFromDataUrl(dataUrl || "");
    if (!payload) throw new Error("INVALID_DATA_URL");
    await bucket.put(storageKey, payload.bytes, { httpMetadata: { contentType: mime || payload.mime || "application/octet-stream" } });
    await db.prepare(`DELETE FROM drive_file_blobs WHERE org_id = ? AND file_id = ?`).bind(orgId, fileId).run();
    return;
  }
  await db.prepare(
    `INSERT INTO drive_file_blobs (file_id, org_id, mime, data_url, text_content, encrypted_payload, encrypted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, '', 0, ?, ?)
     ON CONFLICT(file_id) DO UPDATE SET mime = excluded.mime, data_url = excluded.data_url, text_content = excluded.text_content, encrypted_payload = '', encrypted = 0, updated_at = excluded.updated_at`
  ).bind(fileId, orgId, mime || "application/octet-stream", dataUrl || "", textContent || "", t, t).run();
}

export async function deleteFileBlob(env, { orgId, fileId, storageKey }) {
  await ensureDriveSchema(env);
  const bucket = getDriveBucket(env);
  if (bucket && storageKey) {
    try { await bucket.delete(storageKey); } catch {}
  }
  const db = getDb(env);
  await db.prepare(`DELETE FROM drive_file_blobs WHERE org_id = ? AND file_id = ?`).bind(orgId, fileId).run();
}

export function created(name, entity) {
  return json({ ok: true, id: entity?.id || null, [name]: entity || null });
}

export { getDb, bad, json, now, uuid };
