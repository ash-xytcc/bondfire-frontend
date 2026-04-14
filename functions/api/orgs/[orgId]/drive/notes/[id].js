import { bad } from "../../../../_lib/http.js";
import { requireOrgRole } from "../../../../_lib/auth.js";
import {
  ensureDriveSchema,
  getDb,
  normalizeNullableId,
  parseTags,
  json,
  now,
} from "../../../../_lib/drive.js";
import { slugify } from "../../../../_lib/bulletin.js";

function normalizeBulletinStatus(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "draft" || v === "published") return v;
  return "";
}

function cleanBulletinSlug(value, fallbackTitle = "") {
  const raw = String(value || "").trim();
  return raw ? slugify(raw) : slugify(fallbackTitle || "");
}

function normalizeNote(row) {
  return {
    id: row.id,
    parentId: row.parent_id || null,
    title: row.encrypted_blob ? "encrypted note" : row.title || "untitled",
    body: row.encrypted_blob ? "" : row.content || "",
    tags: row.encrypted_blob ? [] : parseTags(row.tags),
    encryptedBlob: row.encrypted_blob || "",
    bulletinSlug: row.bulletin_slug || "",
    bulletinExcerpt: row.bulletin_excerpt || "",
    bulletinStatus: row.bulletin_status || "",
    bulletinPublishedAt: row.bulletin_published_at || null,
    createdAt: Number(row.created_at || 0),
    updatedAt: Number(row.updated_at || 0),
  };
}

export async function onRequestGet({ env, request, params }) {
  const orgId = params.orgId;
  const noteId = params.id;

  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  await ensureDriveSchema(env);

  const row = await getDb(env)
    .prepare(`
      SELECT id, parent_id, title, content, tags,
             encrypted_blob,
             bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at,
             created_at, updated_at
      FROM drive_notes
      WHERE org_id = ? AND id = ?
    `)
    .bind(orgId, noteId)
    .first();

  if (!row) return bad(404, "NOT_FOUND");
  return json({ ok: true, note: normalizeNote(row) });
}

export async function onRequestPatch({ env, request, params }) {
  const orgId = params.orgId;
  const noteId = params.id;

  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureDriveSchema(env);

  const body = await request.json().catch(() => ({}));
  const db = getDb(env);

  const existing = await db
    .prepare(`SELECT * FROM drive_notes WHERE org_id = ? AND id = ?`)
    .bind(orgId, noteId)
    .first();

  if (!existing) return bad(404, "NOT_FOUND");

  const encryptedBlob =
    body.encryptedBlob === undefined
      ? existing.encrypted_blob || null
      : (String(body.encryptedBlob || "") || null);

  const nextTitle = encryptedBlob
    ? "encrypted note"
    : (body.title === undefined
        ? existing.title
        : (String(body.title || "untitled").trim() || "untitled"));

  const nextBody = encryptedBlob
    ? ""
    : (body.body === undefined && body.content === undefined
        ? existing.content
        : String(body.body ?? body.content ?? ""));

  const nextTags = encryptedBlob
    ? ""
    : (Object.prototype.hasOwnProperty.call(body, "tags")
        ? parseTags(body.tags).join(",")
        : existing.tags);

  const nextBulletinStatus = Object.prototype.hasOwnProperty.call(body, "bulletinStatus")
    ? normalizeBulletinStatus(body.bulletinStatus)
    : String(existing.bulletin_status || "");

  const nextBulletinSlug = nextBulletinStatus
    ? (
        Object.prototype.hasOwnProperty.call(body, "bulletinSlug")
          ? cleanBulletinSlug(body.bulletinSlug, nextTitle)
          : String(existing.bulletin_slug || "").trim() || cleanBulletinSlug("", nextTitle)
      )
    : "";

  const nextBulletinExcerpt = Object.prototype.hasOwnProperty.call(body, "bulletinExcerpt")
    ? String(body.bulletinExcerpt || "").trim()
    : String(existing.bulletin_excerpt || "");

  let nextBulletinPublishedAt = existing.bulletin_published_at || null;

  if (!nextBulletinStatus) {
    nextBulletinPublishedAt = null;
  }

  if (nextBulletinStatus === "published" && !nextBulletinPublishedAt) {
    nextBulletinPublishedAt = new Date().toISOString();
  }

  await db.prepare(`
    UPDATE drive_notes
    SET parent_id = ?,
        title = ?,
        content = ?,
        tags = ?,
        encrypted_blob = ?,
        bulletin_slug = ?,
        bulletin_excerpt = ?,
        bulletin_status = ?,
        bulletin_published_at = ?,
        updated_at = ?
    WHERE org_id = ? AND id = ?
  `).bind(
    Object.prototype.hasOwnProperty.call(body, "parentId")
      ? normalizeNullableId(body.parentId)
      : existing.parent_id || null,
    nextTitle,
    nextBody,
    nextTags,
    encryptedBlob,
    nextBulletinSlug || null,
    nextBulletinExcerpt,
    nextBulletinStatus,
    nextBulletinPublishedAt,
    now(),
    orgId,
    noteId
  ).run();

  const row = await db
    .prepare(`
      SELECT id, parent_id, title, content, tags,
             encrypted_blob,
             bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at,
             created_at, updated_at
      FROM drive_notes
      WHERE org_id = ? AND id = ?
    `)
    .bind(orgId, noteId)
    .first();

  return json({ ok: true, note: normalizeNote(row) });
}

export async function onRequestDelete({ env, request, params }) {
  const orgId = params.orgId;
  const noteId = params.id;

  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureDriveSchema(env);

  await getDb(env)
    .prepare(`DELETE FROM drive_notes WHERE org_id = ? AND id = ?`)
    .bind(orgId, noteId)
    .run();

  return json({ ok: true, deleted: true, id: noteId });
}