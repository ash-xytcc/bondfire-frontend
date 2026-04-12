import { requireUser, requireOrgRole } from "../../../_lib/auth.js";
import {
  ensureBulletinTable,
  uniqueSlug,
  normalizePost,
  deriveExcerpt,
  publishTimestamp,
  nowIso,
} from "../../../_lib/bulletin.js";

export const onRequestGet = async (context) => {
  try {
    const { env, params, request } = context;
    await requireUser(request, env);
    await requireOrgRole(request, env, params.orgId, ["admin", "owner"]);

    await ensureBulletinTable(env.BF_DB);

    const url = new URL(request.url);
    const status = (url.searchParams.get("status") || "").trim();

    let stmt;
    if (status) {
      stmt = env.BF_DB.prepare(`
        SELECT *
        FROM bulletin_posts
        WHERE org_id = ? AND status = ?
        ORDER BY
          CASE WHEN published_at IS NULL THEN updated_at ELSE published_at END DESC,
          updated_at DESC
      `).bind(String(params.orgId), status);
    } else {
      stmt = env.BF_DB.prepare(`
        SELECT *
        FROM bulletin_posts
        WHERE org_id = ?
        ORDER BY
          CASE WHEN published_at IS NULL THEN updated_at ELSE published_at END DESC,
          updated_at DESC
      `).bind(String(params.orgId));
    }

    const { results } = await stmt.all();
    return Response.json({ ok: true, posts: (results || []).map(normalizePost) });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};

export const onRequestPost = async (context) => {
  try {
    const { env, params, request } = context;
    const user = await requireUser(request, env);
    await requireOrgRole(request, env, params.orgId, ["admin", "owner"]);

    await ensureBulletinTable(env.BF_DB);

    const body = await request.json().catch(() => ({}));
    const title = String(body?.title || "").trim();
    const text = String(body?.body || "").trim();
    const status = body?.status === "published" ? "published" : "draft";

    if (!title) {
      return Response.json(
        { ok: false, error: "VALIDATION", message: "Title is required" },
        { status: 400 }
      );
    }

    const slug = await uniqueSlug(env.BF_DB, params.orgId, title);
    const excerpt = deriveExcerpt(text, body?.excerpt);
    const publishedAt = publishTimestamp(status, null);
    const ts = nowIso();

    const result = await env.BF_DB.prepare(`
      INSERT INTO bulletin_posts (
        org_id, title, slug, excerpt, body, status,
        author_id, author_name, published_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        String(params.orgId),
        title,
        slug,
        excerpt,
        text,
        status,
        String(user?.id || ""),
        String(user?.name || user?.email || ""),
        publishedAt,
        ts,
        ts
      )
      .run();

    const row = await env.BF_DB.prepare(
      `SELECT * FROM bulletin_posts WHERE id = ? LIMIT 1`
    )
      .bind(result.meta.last_row_id)
      .first();

    return Response.json({ ok: true, post: normalizePost(row) });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};
