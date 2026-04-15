export function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function ensurePublicSiteTable(env) {
  if (!env?.BF_DB) return false;
  await env.BF_DB
    .prepare(`
      CREATE TABLE IF NOT EXISTS public_site_configs (
        org_id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        cfg_json TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    .run();
  return true;
}

function hasKv(env) {
  return !!env?.BF_PUBLIC && typeof env.BF_PUBLIC.get === "function";
}

export async function uniqueSlug(env, base, orgId) {
  const cleanBase = slugify(base || "org") || "org";
  let trySlug = cleanBase;
  let n = 0;

  while (true) {
    const existingOrgId = await getOrgIdBySlug(env, trySlug);
    if (!existingOrgId || existingOrgId === orgId) return trySlug;
    n += 1;
    trySlug = `${cleanBase}-${n}`;
  }
}

export async function getPublicCfg(env, orgId) {
  if (!orgId) return {};

  if (hasKv(env)) {
    const raw = await env.BF_PUBLIC.get(`org:${orgId}`);
    return raw ? JSON.parse(raw) : {};
  }

  if (await ensurePublicSiteTable(env)) {
    const row = await env.BF_DB
      .prepare(`SELECT cfg_json FROM public_site_configs WHERE org_id = ?1`)
      .bind(String(orgId))
      .first();

    return row?.cfg_json ? JSON.parse(row.cfg_json) : {};
  }

  return {};
}

export async function setPublicCfg(env, orgId, cfg) {
  if (!orgId) return;

  if (hasKv(env)) {
    await env.BF_PUBLIC.put(`org:${orgId}`, JSON.stringify(cfg));
    return;
  }

  if (await ensurePublicSiteTable(env)) {
    await env.BF_DB
      .prepare(`
        INSERT INTO public_site_configs (org_id, slug, cfg_json, updated_at)
        VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
        ON CONFLICT(org_id) DO UPDATE SET
          slug = excluded.slug,
          cfg_json = excluded.cfg_json,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(String(orgId), String(cfg?.slug || ""), JSON.stringify(cfg || {}))
      .run();
  }
}

export async function setSlugMapping(env, slug, orgId) {
  const s = String(slug || "").trim().toLowerCase();
  if (!s || !orgId) return;

  if (hasKv(env)) {
    await env.BF_PUBLIC.put(`slug:${s}`, String(orgId));
    return;
  }

  if (await ensurePublicSiteTable(env)) {
    await env.BF_DB
      .prepare(`
        INSERT INTO public_site_configs (org_id, slug, cfg_json, updated_at)
        VALUES (?1, ?2, COALESCE((SELECT cfg_json FROM public_site_configs WHERE org_id = ?1), '{}'), CURRENT_TIMESTAMP)
        ON CONFLICT(org_id) DO UPDATE SET
          slug = excluded.slug,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(String(orgId), s)
      .run();
  }
}

export async function removeSlugMapping(env, slug) {
  const s = String(slug || "").trim().toLowerCase();
  if (!s) return;

  if (hasKv(env)) {
    await env.BF_PUBLIC.delete(`slug:${s}`);
    return;
  }

  if (await ensurePublicSiteTable(env)) {
    await env.BF_DB
      .prepare(`UPDATE public_site_configs SET slug = '', updated_at = CURRENT_TIMESTAMP WHERE lower(slug) = ?1`)
      .bind(s)
      .run();
  }
}

export async function getOrgIdBySlug(env, slug) {
  const s = String(slug || "").trim().toLowerCase();
  if (!s) return null;

  if (hasKv(env)) {
    const orgId = await env.BF_PUBLIC.get(`slug:${s}`);
    return orgId || null;
  }

  if (await ensurePublicSiteTable(env)) {
    const row = await env.BF_DB
      .prepare(`SELECT org_id FROM public_site_configs WHERE lower(slug) = ?1`)
      .bind(s)
      .first();
    return row?.org_id || null;
  }

  return null;
}

export async function resolveSlug(env, slug) {
  return await getOrgIdBySlug(env, slug);
}
