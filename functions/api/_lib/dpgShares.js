import { now, uuid } from "./http.js";

export function getDb(env) {
  return env?.BF_DB || env?.DB || env?.db || null;
}

export async function ensureDpgSharesSchema(env) {
  const db = getDb(env);
  if (!db) throw new Error("NO_DB_BINDING");
  if (env.__bfDpgSharesSchemaReady) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS dpg_shares_videos (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      video_url TEXT NOT NULL DEFAULT '',
      thumbnail_url TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      duration_text TEXT NOT NULL DEFAULT '',
      meta_text TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      published_at INTEGER
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_dpg_shares_org_slug ON dpg_shares_videos(org_id, slug)`,
    `CREATE INDEX IF NOT EXISTS idx_dpg_shares_org_status_pub ON dpg_shares_videos(org_id, status, featured, published_at DESC, updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_dpg_shares_org_updated ON dpg_shares_videos(org_id, updated_at DESC)`
  ];

  for (const sql of statements) {
    await db.prepare(sql).run();
  }

  env.__bfDpgSharesSchemaReady = true;
}

export function slugifyShare(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueShareSlug(env, orgId, raw, excludeId = "") {
  const db = getDb(env);
  const base = slugifyShare(raw) || `share-${Math.random().toString(36).slice(2, 8)}`;
  let slug = base;
  let n = 2;

  for (;;) {
    const row = await db.prepare(
      `SELECT id FROM dpg_shares_videos WHERE org_id = ? AND slug = ?`
    ).bind(orgId, slug).first();

    if (!row || String(row.id || "") === String(excludeId || "")) return slug;
    slug = `${base}-${n++}`;
  }
}

export function cleanShareInput(body = {}) {
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const videoUrl = String(body?.videoUrl || body?.video_url || "").trim();
  const thumbnailUrl = String(body?.thumbnailUrl || body?.thumbnail_url || "").trim();
  const durationText = String(body?.durationText || body?.duration_text || "").trim();
  const metaText = String(body?.metaText || body?.meta_text || "").trim();
  const status = String(body?.status || "published").trim().toLowerCase() === "draft" ? "draft" : "published";
  const featured = !!body?.featured;
  const tags = Array.isArray(body?.tags)
    ? body.tags.map((x) => String(x || "").trim()).filter(Boolean).slice(0, 12)
    : String(body?.tags || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 12);

  return {
    title,
    description,
    videoUrl,
    thumbnailUrl,
    durationText,
    metaText,
    status,
    featured,
    tags,
  };
}

export function rowToShare(row = {}) {
  const tags = String(row.tags || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    id: String(row.id || ""),
    orgId: String(row.org_id || ""),
    slug: String(row.slug || ""),
    title: String(row.title || ""),
    description: String(row.description || ""),
    videoUrl: String(row.video_url || ""),
    thumbnailUrl: String(row.thumbnail_url || ""),
    tags,
    durationText: String(row.duration_text || ""),
    metaText: String(row.meta_text || ""),
    featured: !!Number(row.featured || 0),
    status: String(row.status || "draft"),
    createdBy: String(row.created_by || ""),
    createdAt: Number(row.created_at || 0),
    updatedAt: Number(row.updated_at || 0),
    publishedAt: Number(row.published_at || 0),
  };
}

export async function createShare(env, orgId, userId, input) {
  await ensureDpgSharesSchema(env);
  const db = getDb(env);
  const t = now();
  const id = uuid();
  const slug = await uniqueShareSlug(env, orgId, input.title || "share");
  const publishedAt = input.status === "published" ? t : null;

  if (input.featured) {
    await db.prepare(
      `UPDATE dpg_shares_videos
       SET featured = 0, updated_at = ?
       WHERE org_id = ?`
    ).bind(t, orgId).run();
  }

  await db.prepare(
    `INSERT INTO dpg_shares_videos (
      id, org_id, slug, title, description, video_url, thumbnail_url, tags,
      duration_text, meta_text, featured, status, created_by, created_at, updated_at, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    orgId,
    slug,
    input.title,
    input.description,
    input.videoUrl,
    input.thumbnailUrl,
    input.tags.join(", "),
    input.durationText,
    input.metaText,
    input.featured ? 1 : 0,
    input.status,
    String(userId || ""),
    t,
    t,
    publishedAt
  ).run();

  const row = await db.prepare(
    `SELECT * FROM dpg_shares_videos WHERE id = ?`
  ).bind(id).first();

  return rowToShare(row || {});
}

export async function listPublicShares(env, orgId = "dpg", limit = 12) {
  await ensureDpgSharesSchema(env);
  const db = getDb(env);

  const res = await db.prepare(
    `SELECT *
     FROM dpg_shares_videos
     WHERE org_id = ? AND status = 'published'
     ORDER BY featured DESC, COALESCE(published_at, updated_at, created_at) DESC
     LIMIT ?`
  ).bind(orgId, Number(limit || 12)).all();

  const items = (res.results || []).map(rowToShare);
  const featured = items.find((x) => x.featured) || items[0] || null;

  return {
    items,
    featured,
  };
}
