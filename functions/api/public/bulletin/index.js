import { ensureBulletinTable, normalizePost } from "../../_lib/bulletin.js";

export const onRequestGet = async ({ env, request }) => {
  try {
    await ensureBulletinTable(env.BF_DB);

    const url = new URL(request.url);
    const orgSlug = String(url.searchParams.get("org") || "").trim();
    const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit") || 10)));

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
      return Response.json({ ok: true, posts: [] });
    }

    const { results } = await env.BF_DB.prepare(`
      SELECT *
      FROM bulletin_posts
      WHERE org_id = ? AND status = 'published'
      ORDER BY published_at DESC, updated_at DESC
      LIMIT ?
    `)
      .bind(String(org.id), limit)
      .all();

    return Response.json({
      ok: true,
      org: { id: String(org.id), slug: org.slug, name: org.name },
      posts: (results || []).map(normalizePost),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: "SERVER_ERROR", message: String(err?.message || err) },
      { status: 500 }
    );
  }
};
