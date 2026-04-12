function nowIso() {
  return new Date().toISOString();
}

async function hasColumn(db, tableName, columnName) {
  const rows = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  const cols = Array.isArray(rows?.results) ? rows.results : [];
  return cols.some((c) => String(c.name) === String(columnName));
}

export async function ensureBulletinTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS bulletin_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id TEXT NOT NULL
    )
  `).run();

  if (!(await hasColumn(db, "bulletin_posts", "title"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN title TEXT NOT NULL DEFAULT ''`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "slug"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN slug TEXT NOT NULL DEFAULT ''`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "excerpt"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN excerpt TEXT NOT NULL DEFAULT ''`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "body"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN body TEXT NOT NULL DEFAULT ''`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "status"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "author_id"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN author_id TEXT`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "author_name"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN author_name TEXT`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "published_at"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN published_at TEXT`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "created_at"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`).run();
  }

  if (!(await hasColumn(db, "bulletin_posts", "updated_at"))) {
    await db.prepare(`ALTER TABLE bulletin_posts ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`).run();
  }

  await db.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_bulletin_posts_org_slug
    ON bulletin_posts(org_id, slug)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_bulletin_posts_org_status_published
    ON bulletin_posts(org_id, status, published_at DESC)
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_bulletin_posts_org_updated
    ON bulletin_posts(org_id, updated_at DESC)
  `).run();
}

export function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

export async function uniqueSlug(db, orgId, title, excludeId = null) {
  const base = slugify(title);
  let slug = base;
  let i = 2;

  while (true) {
    const row = excludeId
      ? await db
          .prepare(
            `SELECT id FROM bulletin_posts WHERE org_id = ? AND slug = ? AND id != ? LIMIT 1`
          )
          .bind(String(orgId), slug, Number(excludeId))
          .first()
      : await db
          .prepare(
            `SELECT id FROM bulletin_posts WHERE org_id = ? AND slug = ? LIMIT 1`
          )
          .bind(String(orgId), slug)
          .first();

    if (!row) return slug;
    slug = `${base}-${i++}`;
  }
}

export function normalizePost(row) {
  if (!row) return null;
  return {
    id: row.id,
    orgId: String(row.org_id),
    title: row.title || "",
    slug: row.slug || "",
    excerpt: row.excerpt || "",
    body: row.body || "",
    status: row.status || "draft",
    authorId: row.author_id || null,
    authorName: row.author_name || "",
    publishedAt: row.published_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

export function deriveExcerpt(body, explicitExcerpt = "") {
  const clean = String(explicitExcerpt || "").trim();
  if (clean) return clean.slice(0, 280);

  return String(body || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

export function publishTimestamp(status, existingPublishedAt = null) {
  if (status !== "published") return null;
  return existingPublishedAt || nowIso();
}

export { nowIso };
