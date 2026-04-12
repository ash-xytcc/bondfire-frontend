import { ensureBulletinTable, normalizePost } from "../../_lib/bulletin.js";

export const onRequestGet = async ({ env, request, params }) => {
  try {
    await ensureBulletinTable(env.BF_DB);

    const url = new URL(request.url);
    const orgSlug = String(url.searchParams.get("org") || "").trim();

    if (!orgSlug) {
      return Response.json(
        { ok: false, error: "VALIDATION", message: "org query param required" },
        { status: 400 }
      );
    }

    const org = await env.BF_DB.prepare(
      `SELECT id, slug, name FROM orgs WHERE slug = ? LIMIT 1`
    )
      .bind(orgSlug)
      .first();

    if (!org) {
      return Response.json(
        { ok: false, error: "NOT_FOUND", message: "Org not found" },
        { status: 404 }
      );
    }

    const row = await env.BF_DB.prepare(`
      SELECT *
      FROM bulletin_posts
      WHERE org_id = ? AND slug = ? AND status = 'published'
      LIMIT 1
    `)
      .bind(String(org.id), String(params.slug))
      .first();

    if (!row) {
      return Response.json(
        { ok: false, error: "NOT_FOUND", message: "Post not found" },
        { status: 404 }
      );
    }

    return Response.json({
      ok: true,
      org: { id: String(org.id), slug: org.slug, name: org.name },
      post: normalizePost(row),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};
