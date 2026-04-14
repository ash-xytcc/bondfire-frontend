import { ensureBulletinTable, normalizePost } from "../../_lib/bulletin.js";
import { ensureDriveSchema } from "../../_lib/drive.js";

async function hasColumn(db, tableName, columnName) {
  const rows = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  const cols = Array.isArray(rows?.results) ? rows.results : [];
  return cols.some((c) => String(c.name) === String(columnName));
}

async function resolveOrg(db, requestedSlug) {
  const orgsHaveSlug = await hasColumn(db, "orgs", "slug");
  const orgsHaveName = await hasColumn(db, "orgs", "name");

  if (orgsHaveSlug && requestedSlug) {
    const row = await db.prepare(
      `SELECT id, slug, ${orgsHaveName ? "name" : "NULL as name"} FROM orgs WHERE slug = ? LIMIT 1`
    ).bind(String(requestedSlug)).first();
    if (row) return row;
  }

  const fallback = await db.prepare(
    `SELECT id, ${orgsHaveSlug ? "slug" : "NULL as slug"}, ${orgsHaveName ? "name" : "NULL as name"} FROM orgs ORDER BY id ASC LIMIT 1`
  ).first();

  return fallback || null;
}

function normalizeDriveNotePost(row, orgId) {
  return {
    id: `drive:${row.id}`,
    orgId: String(orgId),
    title: row.title || "",
    slug: row.bulletin_slug || "",
    excerpt: row.bulletin_excerpt || "",
    body: row.content || "",
    status: row.bulletin_status || "draft",
    authorId: null,
    authorName: "",
    publishedAt: row.bulletin_published_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    source: "drive_note",
    docId: row.id,
  };
}

export const onRequestGet = async ({ env, request, params }) => {
  try {
    await ensureBulletinTable(env.BF_DB);
    await ensureDriveSchema(env);

    const url = new URL(request.url);
    const requestedSlug = String(url.searchParams.get("org") || "").trim();

    const org = await resolveOrg(env.BF_DB, requestedSlug);

    if (!org) {
      return Response.json(
        { ok: false, error: "NOT_FOUND", message: "Org not found" },
        { status: 404 }
      );
    }

    const legacy = await env.BF_DB.prepare(`
      SELECT *
      FROM bulletin_posts
      WHERE org_id = ? AND slug = ? AND status = 'published'
      LIMIT 1
    `).bind(String(org.id), String(params.slug)).first();

    if (legacy) {
      return Response.json({
        ok: true,
        org: {
          id: String(org.id),
          slug: org.slug || requestedSlug || "",
          name: org.name || "",
        },
        post: normalizePost(legacy),
      });
    }

    const driveNote = await env.BF_DB.prepare(`
      SELECT id, title, content, bulletin_slug, bulletin_excerpt, bulletin_status, bulletin_published_at, created_at, updated_at
      FROM drive_notes
      WHERE org_id = ? AND bulletin_slug = ? AND bulletin_status = 'published'
      LIMIT 1
    `).bind(String(org.id), String(params.slug)).first();

    if (!driveNote) {
      return Response.json(
        { ok: false, error: "NOT_FOUND", message: "Post not found" },
        { status: 404 }
      );
    }

    return Response.json({
      ok: true,
      org: {
        id: String(org.id),
        slug: org.slug || requestedSlug || "",
        name: org.name || "",
      },
      post: normalizeDriveNotePost(driveNote, org.id),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};
