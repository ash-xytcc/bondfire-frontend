import { bad, json, now, uuid } from "./http.js";

function getDb(env) { return env?.BF_DB || env?.DB || env?.db || null; }
export function getDriveBucket(env) { return env?.BF_DRIVE_BUCKET || env?.DRIVE_BUCKET || env?.BOND_FIRE_DRIVE_BUCKET || null; }

export async function ensureDriveSchema(env) {
  const db=getDb(env);
  if(!db) throw new Error("NO_DB_BINDING");
  if(env.__bfDriveSchemaReady) return;
  const statements=[
    "CREATE TABLE IF NOT EXISTS drive_folders (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, name TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_folders_org_parent ON drive_folders(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_notes (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, title TEXT, content TEXT, tags TEXT, encrypted_blob TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_notes_org_parent ON drive_notes(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_files (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, parent_id TEXT, name TEXT, mime TEXT, size INTEGER, storage_key TEXT, encrypted INTEGER NOT NULL DEFAULT 0, encrypted_blob TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_files_org_parent ON drive_files(org_id, parent_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_templates (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, name TEXT, title TEXT, content TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_templates_org ON drive_templates(org_id, updated_at)",
    "CREATE TABLE IF NOT EXISTS drive_file_blobs (file_id TEXT PRIMARY KEY, org_id TEXT NOT NULL, mime TEXT, data_url TEXT, text_content TEXT, encrypted_payload TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    "CREATE INDEX IF NOT EXISTS idx_drive_file_blobs_org ON drive_file_blobs(org_id, updated_at)",
  ];
  for(const sql of statements) await db.prepare(sql).run();
  for(const sql of [
    "ALTER TABLE drive_notes ADD COLUMN encrypted_blob TEXT",
    "ALTER TABLE drive_files ADD COLUMN encrypted INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE drive_files ADD COLUMN encrypted_blob TEXT",
    "ALTER TABLE drive_file_blobs ADD COLUMN encrypted_payload TEXT",
  ]) { try { await db.prepare(sql).run(); } catch {} }
  env.__bfDriveSchemaReady=true;
}

export function encrypt(data) { return data; }
export function decrypt(data) { return data; }
export function normalizeNullableId(value) { return value===undefined||value===null||value===""?null:String(value); }
export function parseTags(value) {
  if(Array.isArray(value)) return value.map((x)=>String(x||"").trim()).filter(Boolean);
  return String(value||"").split(",").map((x)=>x.trim()).filter(Boolean);
}
export function splitDataUrl(dataUrl) {
  const match=String(dataUrl||"").match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/i);
  return match?{mime:match[1]||"application/octet-stream",base64:match[2]||""}:null;
}
export function bytesFromDataUrl(dataUrl) {
  const parts=splitDataUrl(dataUrl); if(!parts) return null;
  const bin=atob(parts.base64),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i+=1) bytes[i]=bin.charCodeAt(i);
  return {mime:parts.mime,bytes};
}
export function dataUrlFromBytes(bytes,mime) {
  let bin=""; const arr=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
  for(let i=0;i<arr.length;i+=1) bin+=String.fromCharCode(arr[i]);
  return `data:${String(mime||"application/octet-stream")};base64,${btoa(bin)}`;
}
export function textFromBytes(bytes) { try { return new TextDecoder().decode(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[])); } catch { return ""; } }
export function isEditableTextMime(mime,name="") {
  const m=String(mime||"").toLowerCase(),n=String(name||"").toLowerCase();
  if(m.startsWith("text/")) return true;
  return [".md",".markdown",".txt",".json",".js",".jsx",".ts",".tsx",".css",".html",".xml",".yaml",".yml",".csv",".bfsheet",".bfform"].some((ext)=>n.endsWith(ext)) || ["application/vnd.bondfire.sheet+json","application/vnd.bondfire.form+json","application/vnd.bondfire.zk-file"].includes(m);
}
export function buildDriveFileUrls(orgId,fileId) {
  const base=`/api/orgs/${encodeURIComponent(String(orgId||""))}/drive/files/${encodeURIComponent(String(fileId||""))}/download`;
  return {previewUrl:base,downloadUrl:`${base}?download=1`,url:base};
}

export async function listDriveTree(env,orgId) {
  await ensureDriveSchema(env); const db=getDb(env);
  const [foldersRes,notesRes,filesRes,templatesRes]=await Promise.all([
    db.prepare(`SELECT id,parent_id,name,created_at,updated_at FROM drive_folders WHERE org_id=? ORDER BY LOWER(name) ASC,created_at ASC`).bind(orgId).all(),
    db.prepare(`SELECT id,parent_id,title,content,tags,encrypted_blob,created_at,updated_at FROM drive_notes WHERE org_id=? ORDER BY updated_at DESC,created_at DESC`).bind(orgId).all(),
    db.prepare(`SELECT id,parent_id,name,mime,size,storage_key,encrypted,encrypted_blob,created_at,updated_at FROM drive_files WHERE org_id=? ORDER BY LOWER(name) ASC,created_at ASC`).bind(orgId).all(),
    db.prepare(`SELECT id,name,title,content,created_at,updated_at FROM drive_templates WHERE org_id=? ORDER BY updated_at DESC,created_at DESC`).bind(orgId).all(),
  ]);
  return {
    folders:(foldersRes.results||[]).map((r)=>({id:r.id,parentId:r.parent_id||null,name:r.name||"untitled folder",createdAt:Number(r.created_at||0),updatedAt:Number(r.updated_at||0)})),
    notes:(notesRes.results||[]).map((r)=>({id:r.id,parentId:r.parent_id||null,title:r.encrypted_blob?"encrypted note":r.title||"untitled",body:r.encrypted_blob?"":r.content||"",tags:r.encrypted_blob?[]:parseTags(r.tags),encryptedBlob:r.encrypted_blob||"",createdAt:Number(r.created_at||0),updatedAt:Number(r.updated_at||0)})),
    files:(filesRes.results||[]).map((r)=>({id:r.id,parentId:r.parent_id||null,name:r.encrypted_blob?"encrypted file":r.name||"file",mime:r.encrypted_blob?"application/octet-stream":r.mime||"application/octet-stream",size:Number(r.size||0),encrypted:Number(r.encrypted||0)===1,encryptedBlob:r.encrypted_blob||"",storageKey:r.storage_key||null,createdAt:Number(r.created_at||0),updatedAt:Number(r.updated_at||0),...buildDriveFileUrls(orgId,r.id)})),
    templates:(templatesRes.results||[]).map((r)=>({id:r.id,name:r.name||"template",title:r.title||"untitled",body:r.content||"",createdAt:Number(r.created_at||0),updatedAt:Number(r.updated_at||0)})),
  };
}

export async function getFileRecord(env,orgId,fileId,{includeData=false}={}) {
  await ensureDriveSchema(env); const db=getDb(env);
  const r=await db.prepare(`SELECT id,parent_id,name,mime,size,storage_key,encrypted,encrypted_blob,created_at,updated_at FROM drive_files WHERE org_id=? AND id=?`).bind(orgId,fileId).first();
  if(!r) return null;
  const file={id:r.id,parentId:r.parent_id||null,name:r.encrypted_blob?"encrypted file":r.name||"file",mime:r.encrypted_blob?"application/octet-stream":r.mime||"application/octet-stream",size:Number(r.size||0),storageKey:r.storage_key||null,encrypted:Number(r.encrypted||0)===1,encryptedBlob:r.encrypted_blob||"",createdAt:Number(r.created_at||0),updatedAt:Number(r.updated_at||0),...buildDriveFileUrls(orgId,r.id)};
  if(!includeData) return file;
  const blob=await loadFileBlob(env,orgId,r.id,r.storage_key,file.mime,file.name,file.encrypted);
  return {...file,dataUrl:blob?.dataUrl||"",textContent:blob?.textContent||"",encryptedPayload:blob?.encryptedPayload||""};
}

export async function loadFileBlob(env,orgId,fileId,storageKey,mime,name="",encrypted=false) {
  await ensureDriveSchema(env); const bucket=getDriveBucket(env);
  if(bucket&&storageKey) {
    const obj=await bucket.get(storageKey);
    if(obj) {
      const arr=new Uint8Array(await obj.arrayBuffer());
      if(encrypted) return {encryptedPayload:new TextDecoder().decode(arr),mime:"application/octet-stream"};
      const effectiveMime=mime||obj.httpMetadata?.contentType||"application/octet-stream";
      return {dataUrl:dataUrlFromBytes(arr,effectiveMime),textContent:isEditableTextMime(effectiveMime,name)?textFromBytes(arr):"",mime:effectiveMime};
    }
  }
  const r=await getDb(env).prepare(`SELECT data_url,text_content,encrypted_payload,mime FROM drive_file_blobs WHERE org_id=? AND file_id=?`).bind(orgId,fileId).first();
  if(!r) return null;
  return encrypted?{encryptedPayload:r.encrypted_payload||"",mime:"application/octet-stream"}:{dataUrl:r.data_url||"",textContent:r.text_content||"",mime:r.mime||mime||"application/octet-stream"};
}

export async function saveFileBlob(env,{orgId,fileId,storageKey,mime,dataUrl,textContent,encryptedPayload,encrypted=false}) {
  await ensureDriveSchema(env); const bucket=getDriveBucket(env),t=now();
  if(bucket&&storageKey) {
    if(encrypted) {
      const bytes=new TextEncoder().encode(String(encryptedPayload||""));
      await bucket.put(storageKey,bytes,{httpMetadata:{contentType:"application/octet-stream"}});
    } else {
      const payload=bytesFromDataUrl(dataUrl||""); if(!payload) throw new Error("INVALID_DATA_URL");
      await bucket.put(storageKey,payload.bytes,{httpMetadata:{contentType:mime||payload.mime||"application/octet-stream"}});
    }
    await getDb(env).prepare(`DELETE FROM drive_file_blobs WHERE org_id=? AND file_id=?`).bind(orgId,fileId).run();
    return;
  }
  if(!encrypted) throw new Error("CIPHERTEXT_REQUIRED");
  await getDb(env).prepare(`INSERT INTO drive_file_blobs (file_id,org_id,mime,data_url,text_content,encrypted_payload,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(file_id) DO UPDATE SET mime=excluded.mime,data_url='',text_content='',encrypted_payload=excluded.encrypted_payload,updated_at=excluded.updated_at`).bind(fileId,orgId,"application/octet-stream","","",String(encryptedPayload||""),t,t).run();
}

export async function deleteFileBlob(env,{orgId,fileId,storageKey}) {
  await ensureDriveSchema(env); const bucket=getDriveBucket(env);
  if(bucket&&storageKey){try{await bucket.delete(storageKey);}catch{}}
  await getDb(env).prepare(`DELETE FROM drive_file_blobs WHERE org_id=? AND file_id=?`).bind(orgId,fileId).run();
}
export function created(name,entity){return json({ok:true,id:entity?.id||null,[name]:entity||null});}
export { getDb,bad,json,now,uuid };
