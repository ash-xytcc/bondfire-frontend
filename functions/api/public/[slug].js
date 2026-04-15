import { resolveSlug, getPublicCfg } from "../_lib/publicPageStore.js";

export async function onRequestGet({ env, params }) {
  const slug = params.slug;

  const orgId = await resolveSlug(env, slug);
  if (!orgId) {
    return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  const cfg = await getPublicCfg(env, orgId);

  if (!cfg || !cfg.enabled) {
    return Response.json({ ok: false, error: "NOT_PUBLIC" }, { status: 404 });
  }

  return Response.json({ ok: true, public: cfg, orgId });
}
