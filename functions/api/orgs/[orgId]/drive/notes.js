import { requireOrgRole } from "../../../_lib/auth.js";
import {
  ensureDriveSchema,
  getDb,
  normalizeNullableId,
  parseTags,
  created,
  json,
  now,
  uuid,
} from "../../../_lib/drive.js";
import { slugify } from "../../../_lib/bulletin.js";

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
  const auth = await requireOrgRole({ env, request, orgId, minRole: "viewer" });
  if (!auth.ok) return auth.resp;

  await ensureDriveSchema(env);

  const res = await getDb(env)
<<<<<<< HEAD
    .prepare(`SELECT id, parent_id, title, content, tags, encrypted_blob, bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at, created_at, updated_at FROM drive_notes WHERE org_id = ? ORDER BY updated_at DESC`)
    .bind(orgId)
    .all();

  return json({ ok: true, notes: (res.results || []).map(normalizeNote) });
=======
    .prepare(`
      SELECT id, parent_id, title, content, tags,
             encrypted_blob,
             bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at,
             created_at, updated_at
      FROM drive_notes
      WHERE org_id = ?
      ORDER BY updated_at DESC
    `)
    .bind(orgId)
    .all();

  return json({
    ok: true,
    notes: (res.results || []).map(normalizeNote),
  });
>>>>>>> a2c3077f (Wire Drive notes directly to public bulletin)
}

export async function onRequestPost({ env, request, params }) {
  const orgId = params.orgId;
  const auth = await requireOrgRole({ env, request, orgId, minRole: "member" });
  if (!auth.ok) return auth.resp;

  await ensureDriveSchema(env);

  const body = await request.json().catch(() => ({}));
  const id = uuid();
  const t = now();

  const noteTitle = String(body.title || "untitled").trim() || "untitled";
  const encryptedBlob = String(body.encryptedBlob || "");
<<<<<<< HEAD
  const bulletinStatus = normalizeBulletinStatus(body.bulletinStatus);
  const bulletinSlug = bulletinStatus ? cleanBulletinSlug(body.bulletinSlug, noteTitle) : "";
  const bulletinExcerpt = String(body.bulletinExcerpt || "").trim();
  const bulletinPublishedAt = bulletinStatus === "published" ? new Date().toISOString() : null;
=======

  const bulletinStatus = normalizeBulletinStatus(body.bulletinStatus);
  const bulletinSlug = bulletinStatus
    ? cleanBulletinSlug(body.bulletinSlug, noteTitle)
    : "";
  const bulletinExcerpt = String(body.bulletinExcerpt || "").trim();
  const bulletinPublishedAt =
    bulletinStatus === "published" ? new Date().toISOString() : null;
>>>>>>> a2c3077f (Wire Drive notes directly to public bulletin)

  const note = {
    id,
    parentId: normalizeNullableId(body.parentId),
    title: noteTitle,
    body: String(body.body || body.content || ""),
    tags: parseTags(body.tags),
    encryptedBlob,
    bulletinSlug,
    bulletinExcerpt,
    bulletinStatus,
    bulletinPublishedAt,
    createdAt: t,
    updatedAt: t,
  };

  await getDb(env)
<<<<<<< HEAD
    .prepare(`INSERT INTO drive_notes (id, org_id, parent_id, title, content, tags, encrypted_blob, bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
=======
    .prepare(`
      INSERT INTO drive_notes (
        id, org_id, parent_id,
        title, content, tags,
        encrypted_blob,
        bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
>>>>>>> a2c3077f (Wire Drive notes directly to public bulletin)
    .bind(
      id,
      orgId,
      note.parentId,
      note.encryptedBlob ? "encrypted note" : note.title,
      note.encryptedBlob ? "" : note.body,
      note.encryptedBlob ? "" : note.tags.join(","),
      note.encryptedBlob || null,
      note.bulletinSlug || null,
      note.bulletinExcerpt || "",
      note.bulletinStatus || "",
      note.bulletinPublishedAt,
      t,
      t
    )
    .run();

  return created("note", note);
}