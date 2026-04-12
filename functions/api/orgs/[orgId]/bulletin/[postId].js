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

    const row = await env.BF_DB.prepare(`
      SELECT * FROM bulletin_posts
      WHERE org_id = ? AND id = ?
      LIMIT 1
    `)
      .bind(String(params.orgId), Number(params.postId))
      .first();

    if (!row) {
      return Response.json(
        { ok: false, error: "NOT_FOUND", message: "Post not found" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true, post: normalizePost(row) });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};

export const onRequestPut = async (context) => {
  try {
    const { env, params, request } = context;
    await requireUser(request, env);
    await requireOrgRole(request, env, params.orgId, ["admin", "owner"]);
    await ensureBulletinTable(env.BF_DB);

    const existing = await env.BF_DB.prepare(`
      SELECT * FROM bulletin_posts
      WHERE org_id = ? AND id = ?
      LIMIT 1
    `)
      .bind(String(params.orgId), Number(params.postId))
      .first();

    if (!existing) {
      return Response.json(
        { ok: false, error: "NOT_FOUND", message: "Post not found" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = String(body?.title ?? existing.title).trim();
    const text = String(body?.body ?? existing.body).trim();
    const status = body?.status === "published" ? "published" : "draft";

    if (!title) {
      return Response.json(
        { ok: false, error: "VALIDATION", message: "Title is required" },
        { status: 400 }
      );
    }

    const slug =
      String(body?.slug || "").trim()
        ? await uniqueSlug(env.BF_DB, params.orgId, body.slug, params.postId)
        : await uniqueSlug(env.BF_DB, params.orgId, title, params.postId);

    const excerpt = deriveExcerpt(text, body?.excerpt ?? existing.excerpt);
    const publishedAt = publishTimestamp(status, existing.published_at);
    const ts = nowIso();

    await env.BF_DB.prepare(`
      UPDATE bulletin_posts
      SET title = ?, slug = ?, excerpt = ?, body = ?, status = ?, published_at = ?, updated_at = ?
      WHERE org_id = ? AND id = ?
    `)
      .bind(
        title,
        slug,
        excerpt,
        text,
        status,
        publishedAt,
        ts,
        String(params.orgId),
        Number(params.postId)
      )
      .run();

    const row = await env.BF_DB.prepare(
      `SELECT * FROM bulletin_posts WHERE org_id = ? AND id = ? LIMIT 1`
    )
      .bind(String(params.orgId), Number(params.postId))
      .first();

    return Response.json({ ok: true, post: normalizePost(row) });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};

export const onRequestDelete = async (context) => {
  try {
    const { env, params, request } = context;
    await requireUser(request, env);
    await requireOrgRole(request, env, params.orgId, ["admin", "owner"]);
    await ensureBulletinTable(env.BF_DB);

    await env.BF_DB.prepare(`
      DELETE FROM bulletin_posts
      WHERE org_id = ? AND id = ?
    `)
      .bind(String(params.orgId), Number(params.postId))
      .run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};
