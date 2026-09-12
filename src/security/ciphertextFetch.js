import { decryptWithOrgKey, encryptWithOrgKey, getCachedOrgKey } from "../lib/zk.js";
import { decryptDriveBytesString, decryptDriveJson, encryptDriveBytesToString, encryptDriveJson } from "../lib/driveZk.js";

const originalFetch = typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null;
const caches = {
  pledges: new Map(),
  driveFolders: new Map(),
  driveNotes: new Map(),
  driveFiles: new Map(),
  driveTemplates: new Map(),
};

function orgMap(cache, orgId) {
  if (!cache.has(orgId)) cache.set(orgId, new Map());
  return cache.get(orgId);
}
function safeJson(text, fallback = null) { try { return JSON.parse(text); } catch { return fallback; } }
function getToken() {
  try {
    return localStorage.getItem("bf_token") || localStorage.getItem("bf_auth_token") || localStorage.getItem("bf_access_token") || localStorage.getItem("bf_accessToken") || sessionStorage.getItem("bf_auth_token") || "";
  } catch { return ""; }
}
function protectedOrg(url) {
  try {
    const u = new URL(url, window.location.origin);
    const m = u.pathname.match(/^\/api\/orgs\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { url: u, orgId: decodeURIComponent(m[1]), route: m[2] };
  } catch { return null; }
}
function requireKey(orgId) {
  const key = getCachedOrgKey(orgId);
  if (!key) throw new Error("This device does not have the organization encryption key loaded.");
  return key;
}
function headersObject(input) {
  const h = new Headers(input || {});
  return h;
}
function jsonBody(init) {
  if (!init || typeof init.body !== "string") return null;
  const type = String(new Headers(init.headers || {}).get("content-type") || "").toLowerCase();
  if (type && !type.includes("json")) return null;
  return safeJson(init.body, null);
}
function withJson(init, value) {
  const headers = headersObject(init?.headers);
  headers.set("Content-Type", "application/json");
  return { ...(init || {}), headers, body: JSON.stringify(value) };
}
function authHeaders(extra = {}) {
  const headers = new Headers(extra);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
async function rawJson(url, init = {}) {
  if (!originalFetch) throw new Error("FETCH_UNAVAILABLE");
  const res = await originalFetch(url, { ...init, headers: authHeaders(init.headers), credentials: "include" });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const text = await res.text().catch(() => "");
  return text ? safeJson(text, {}) : {};
}
function bytesFromDataUrl(value) {
  const match = String(value || "").match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/i);
  if (!match) return null;
  const bin = atob(match[2] || "");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}
function dataUrlFromBytes(bytes, mime) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let bin = "";
  for (let i = 0; i < arr.length; i += 1) bin += String.fromCharCode(arr[i]);
  return `data:${String(mime || "application/octet-stream")};base64,${btoa(bin)}`;
}
function editableMime(mime, name = "") {
  const m = String(mime || "").toLowerCase();
  const n = String(name || "").toLowerCase();
  return m.startsWith("text/") || m === "application/json" || m === "application/vnd.bondfire.sheet+json" || m === "application/vnd.bondfire.form+json" || /\.(md|markdown|txt|json|js|jsx|ts|tsx|css|html|xml|yaml|yml|csv|bfsheet|bfform)$/i.test(n);
}
async function encryptedJson(orgId, value) {
  const key = requireKey(orgId);
  return encryptWithOrgKey(key, JSON.stringify(value));
}
async function decryptedJson(orgId, blob, fallback = {}) {
  const key = getCachedOrgKey(orgId);
  if (!key || !blob) return fallback;
  try { return safeJson(await decryptWithOrgKey(key, blob), fallback) || fallback; } catch { return fallback; }
}

async function transformPledgeRequest(ctx, init) {
  const method = String(init?.method || "GET").toUpperCase();
  if (!ctx.route.startsWith("pledges") || !["POST", "PUT"].includes(method)) return init;
  const body = jsonBody(init);
  if (!body) return init;
  const isPublic = body.is_public === true;
  if (isPublic) return init;
  const cache = orgMap(caches.pledges, ctx.orgId);
  const previous = body.id ? (cache.get(String(body.id)) || {}) : {};
  const merged = { ...previous, ...body };
  const envelope = {
    pledger_name: String(merged.pledger_name ?? merged.name ?? ""),
    pledger_email: String(merged.pledger_email ?? merged.email ?? ""),
    type: String(merged.type ?? merged.title ?? ""),
    amount: merged.amount ?? merged.qty ?? "",
    unit: String(merged.unit ?? ""),
    note: String(merged.note ?? merged.description ?? ""),
    contact: String(merged.contact ?? ""),
  };
  const encrypted_blob = await encryptedJson(ctx.orgId, envelope);
  return withJson(init, {
    id: body.id,
    need_id: merged.need_id ?? merged.needId ?? null,
    status: merged.status || "offered",
    is_public: false,
    encrypted_blob,
  });
}

async function transformDriveRequest(ctx, init) {
  if (!ctx.route.startsWith("drive/")) return init;
  const method = String(init?.method || "GET").toUpperCase();
  if (!["POST", "PUT", "PATCH"].includes(method)) return init;
  requireKey(ctx.orgId);

  if (ctx.route === "drive/files" && init?.body && typeof Blob !== "undefined" && init.body instanceof Blob) {
    const headers = headersObject(init.headers);
    const name = headers.get("x-drive-name") || init.body.name || "file";
    const mime = headers.get("x-drive-mime") || init.body.type || "application/octet-stream";
    const bytes = new Uint8Array(await init.body.arrayBuffer());
    const encryptedPayload = await encryptDriveBytesToString(ctx.orgId, bytes);
    const encryptedBlob = await encryptDriveJson(ctx.orgId, { name, mime, size: bytes.byteLength });
    headers.set("x-drive-name", "encrypted file");
    headers.set("x-drive-mime", "application/octet-stream");
    headers.set("x-drive-encrypted", "1");
    headers.set("x-drive-encrypted-blob", encryptedBlob);
    headers.delete("Content-Type");
    return { ...init, headers, body: new Blob([encryptedPayload], { type: "application/octet-stream" }) };
  }

  const body = jsonBody(init);
  if (!body) return init;

  if (/^drive\/folders(?:\/[^/]+)?$/.test(ctx.route)) {
    if (method === "POST" || Object.prototype.hasOwnProperty.call(body, "name")) {
      const cache = orgMap(caches.driveFolders, ctx.orgId);
      const id = ctx.route.split("/")[2];
      const previous = id ? cache.get(id) || {} : {};
      const name = String(body.name ?? previous.name ?? "untitled folder");
      return withJson(init, { ...body, name: undefined, encryptedBlob: await encryptDriveJson(ctx.orgId, { name }) });
    }
    return init;
  }

  if (/^drive\/notes(?:\/[^/]+)?$/.test(ctx.route)) {
    const touches = ["title", "body", "content", "tags"].some((k) => Object.prototype.hasOwnProperty.call(body, k));
    if (method === "POST" || touches) {
      const id = ctx.route.split("/")[2];
      const previous = id ? orgMap(caches.driveNotes, ctx.orgId).get(id) || {} : {};
      const merged = { ...previous, ...body };
      const encryptedBlob = await encryptDriveJson(ctx.orgId, { title: merged.title || "untitled", body: merged.body ?? merged.content ?? "", tags: Array.isArray(merged.tags) ? merged.tags : [] });
      return withJson(init, { parentId: merged.parentId ?? null, encryptedBlob });
    }
    return init;
  }

  if (/^drive\/templates(?:\/[^/]+)?$/.test(ctx.route)) {
    const id = ctx.route.split("/")[2];
    const previous = id ? orgMap(caches.driveTemplates, ctx.orgId).get(id) || {} : {};
    const merged = { ...previous, ...body };
    const encryptedBlob = await encryptDriveJson(ctx.orgId, { name: merged.name || "template", title: merged.title || "untitled", body: merged.body ?? merged.content ?? "" });
    return withJson(init, { encryptedBlob });
  }

  if (/^drive\/files(?:\/[^/]+)?$/.test(ctx.route)) {
    const id = ctx.route.split("/")[2];
    const cache = orgMap(caches.driveFiles, ctx.orgId);
    const previous = id ? cache.get(id) || {} : {};
    const touches = ["name", "mime", "size", "dataUrl", "textContent"].some((k) => Object.prototype.hasOwnProperty.call(body, k));
    if (method !== "POST" && !touches) return init;
    const merged = { ...previous, ...body };
    const name = String(merged.name || "file");
    const mime = String(merged.mime || "application/octet-stream");
    let bytes = body.dataUrl ? bytesFromDataUrl(body.dataUrl) : null;
    if (!bytes && Object.prototype.hasOwnProperty.call(body, "textContent")) bytes = new TextEncoder().encode(String(body.textContent || ""));
    const encryptedBlob = await encryptDriveJson(ctx.orgId, { name, mime, size: Number(merged.size || bytes?.byteLength || 0) });
    const next = { parentId: merged.parentId ?? null, size: Number(merged.size || bytes?.byteLength || 0), encrypted: 1, encryptedBlob };
    if (bytes) next.encryptedPayload = await encryptDriveBytesToString(ctx.orgId, bytes);
    return withJson(init, next);
  }

  return init;
}

async function migrateLegacyRecord(ctx, type, row) {
  const key = getCachedOrgKey(ctx.orgId);
  if (!key || !row?.id) return;
  try {
    if (type === "people") {
      const encrypted_blob = await encryptedJson(ctx.orgId, { name: row.name || "", role: row.role || "", phone: row.phone || "", skills: row.skills || "", notes: row.notes || "" });
      await rawJson(`${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/people`, { method: "PUT", body: JSON.stringify({ id: row.id, encrypted_blob }) });
    } else if (type === "needs") {
      if (row.is_public) return;
      const encrypted_blob = await encryptedJson(ctx.orgId, { title: row.title || "", description: row.description || "", urgency: row.urgency || "" });
      await rawJson(`${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/needs`, { method: "PUT", body: JSON.stringify({ id: row.id, status: row.status, priority: row.priority, is_public: false, encrypted_blob }) });
    } else if (type === "inventory") {
      if (row.is_public) return;
      const encrypted_blob = await encryptedJson(ctx.orgId, { name: row.name || "", category: row.category || "", location: row.location || "", notes: row.notes || "" });
      await rawJson(`${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/inventory`, { method: "PUT", body: JSON.stringify({ id: row.id, qty: row.qty, unit: row.unit, par: row.par, is_public: false, encrypted_blob }) });
    } else if (type === "meetings") {
      if (row.is_public) return;
      const encrypted_blob = await encryptedJson(ctx.orgId, { title: row.title || "", location: row.location || "", agenda: row.agenda || "", notes: row.notes || "" });
      await rawJson(`${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/meetings`, { method: "PUT", body: JSON.stringify({ id: row.id, starts_at: row.starts_at, ends_at: row.ends_at, is_public: false, encrypted_blob }) });
    } else if (type === "events") {
      const encrypted_blob = await encryptedJson(ctx.orgId, { title: row.title || "", description: row.description || "", location: row.location || "", tags: row.tags || [] });
      await rawJson(`${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/events`, { method: "PUT", body: JSON.stringify({ id: row.id, starts_at: row.starts_at, ends_at: row.ends_at, encrypted_blob }) });
    } else if (type === "pledges") {
      if (row.is_public) return;
      const encrypted_blob = await encryptedJson(ctx.orgId, { pledger_name: row.pledger_name || "", pledger_email: row.pledger_email || "", type: row.type || "", amount: row.amount ?? "", unit: row.unit || "", note: row.note || "", contact: row.contact || "" });
      await rawJson(`${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/pledges`, { method: "PUT", body: JSON.stringify({ id: row.id, need_id: row.need_id, status: row.status, is_public: false, encrypted_blob }) });
    }
  } catch (error) {
    console.warn("ciphertext migration failed", type, row?.id, error);
  }
}

async function migrateLegacyDrive(ctx, kind, row) {
  if (!getCachedOrgKey(ctx.orgId) || !row?.id) return;
  try {
    const base = `${ctx.url.origin}/api/orgs/${encodeURIComponent(ctx.orgId)}/drive`;
    if (kind === "folder") {
      const encryptedBlob = await encryptDriveJson(ctx.orgId, { name: row.name || "untitled folder" });
      await rawJson(`${base}/folders/${encodeURIComponent(row.id)}`, { method: "PATCH", body: JSON.stringify({ encryptedBlob }) });
    } else if (kind === "note") {
      const encryptedBlob = await encryptDriveJson(ctx.orgId, { title: row.title || "untitled", body: row.body || "", tags: row.tags || [] });
      await rawJson(`${base}/notes/${encodeURIComponent(row.id)}`, { method: "PATCH", body: JSON.stringify({ encryptedBlob }) });
    } else if (kind === "template") {
      const encryptedBlob = await encryptDriveJson(ctx.orgId, { name: row.name || "template", title: row.title || "untitled", body: row.body || "" });
      await rawJson(`${base}/templates/${encodeURIComponent(row.id)}`, { method: "PATCH", body: JSON.stringify({ encryptedBlob }) });
    } else if (kind === "file") {
      const download = await originalFetch(`${base}/files/${encodeURIComponent(row.id)}/download`, { credentials: "include", headers: authHeaders({ "Content-Type": "application/octet-stream" }) });
      if (!download.ok) return;
      const bytes = new Uint8Array(await download.arrayBuffer());
      const encryptedBlob = await encryptDriveJson(ctx.orgId, { name: row.name || "file", mime: row.mime || "application/octet-stream", size: Number(row.size || bytes.byteLength || 0) });
      const encryptedPayload = await encryptDriveBytesToString(ctx.orgId, bytes);
      await rawJson(`${base}/files/${encodeURIComponent(row.id)}`, { method: "PATCH", body: JSON.stringify({ size: Number(row.size || bytes.byteLength || 0), encryptedBlob, encryptedPayload }) });
    }
  } catch (error) {
    console.warn("Drive ciphertext migration failed", kind, row?.id, error);
  }
}

async function decodeDriveEntity(orgId, kind, row) {
  if (!row || typeof row !== "object") return row;
  const cache = kind === "folder" ? caches.driveFolders : kind === "note" ? caches.driveNotes : kind === "file" ? caches.driveFiles : caches.driveTemplates;
  let out = { ...row };
  if (row.encryptedBlob) {
    const dec = await decryptDriveJson(orgId, row.encryptedBlob, {});
    out = { ...out, ...(dec || {}) };
  }
  if (kind === "file" && row.encryptedPayload) {
    try {
      const bytes = await decryptDriveBytesString(orgId, row.encryptedPayload);
      const name = out.name || "file";
      const mime = out.mime || "application/octet-stream";
      out.dataUrl = dataUrlFromBytes(bytes, mime);
      out.textContent = editableMime(mime, name) ? new TextDecoder().decode(bytes) : "";
    } catch {}
  }
  if (out.id) orgMap(cache, orgId).set(String(out.id), out);
  return out;
}

async function transformResponseData(ctx, data) {
  const key = getCachedOrgKey(ctx.orgId);
  if (!key || !data || typeof data !== "object") return data;

  const decodeRows = async (rows, type) => {
    const out = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      if (row?.encrypted_blob) {
        const dec = await decryptedJson(ctx.orgId, row.encrypted_blob, {});
        const merged = { ...row, ...dec };
        if (type === "pledges" && row.id) orgMap(caches.pledges, ctx.orgId).set(String(row.id), merged);
        out.push(merged);
      } else {
        out.push(row);
        if (row?.id) void migrateLegacyRecord(ctx, type, row);
        if (type === "pledges" && row?.id) orgMap(caches.pledges, ctx.orgId).set(String(row.id), row);
      }
    }
    return out;
  };

  if (Array.isArray(data.people)) data.people = await decodeRows(data.people, "people");
  if (Array.isArray(data.needs)) data.needs = await decodeRows(data.needs, "needs");
  if (Array.isArray(data.inventory)) data.inventory = await decodeRows(data.inventory, "inventory");
  if (Array.isArray(data.items) && ctx.route === "inventory") data.items = await decodeRows(data.items, "inventory");
  if (Array.isArray(data.meetings)) data.meetings = await decodeRows(data.meetings, "meetings");
  if (Array.isArray(data.events)) data.events = await decodeRows(data.events, "events");
  if (data.event?.encrypted_blob) data.event = { ...data.event, ...(await decryptedJson(ctx.orgId, data.event.encrypted_blob, {})) };
  if (Array.isArray(data.pledges)) data.pledges = await decodeRows(data.pledges, "pledges");

  const decodeDriveRows = async (rows, kind) => {
    const out = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      out.push(await decodeDriveEntity(ctx.orgId, kind, row));
      if (row?.id && !row?.encryptedBlob) void migrateLegacyDrive(ctx, kind, row);
    }
    return out;
  };
  if (Array.isArray(data.folders)) data.folders = await decodeDriveRows(data.folders, "folder");
  if (Array.isArray(data.notes)) data.notes = await decodeDriveRows(data.notes, "note");
  if (Array.isArray(data.files)) data.files = await decodeDriveRows(data.files, "file");
  if (Array.isArray(data.templates)) data.templates = await decodeDriveRows(data.templates, "template");
  if (data.folder) data.folder = await decodeDriveEntity(ctx.orgId, "folder", data.folder);
  if (data.note) data.note = await decodeDriveEntity(ctx.orgId, "note", data.note);
  if (data.file) data.file = await decodeDriveEntity(ctx.orgId, "file", data.file);
  if (data.template) data.template = await decodeDriveEntity(ctx.orgId, "template", data.template);
  return data;
}

async function interceptFetch(input, init = {}) {
  const inputUrl = typeof input === "string" || input instanceof URL ? String(input) : input?.url;
  const ctx = protectedOrg(inputUrl || "");
  if (!ctx) return originalFetch(input, init);

  let nextInit = init || {};
  nextInit = await transformPledgeRequest(ctx, nextInit);
  nextInit = await transformDriveRequest(ctx, nextInit);
  const response = await originalFetch(input, nextInit);
  const type = String(response.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("json")) return response;
  const text = await response.clone().text().catch(() => "");
  const data = safeJson(text, null);
  if (data == null) return response;
  const transformed = await transformResponseData(ctx, data);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(JSON.stringify(transformed), { status: response.status, statusText: response.statusText, headers });
}

if (originalFetch && typeof window !== "undefined" && !window.__BF_CIPHERTEXT_FETCH_INSTALLED) {
  window.__BF_CIPHERTEXT_FETCH_INSTALLED = true;
  globalThis.fetch = interceptFetch;
}
