import { getPublicCfg } from "../_lib/publicPageStore.js";

async function getRedHarborCfg(env) {
  if (!env?.BF_DB) return {};

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

  const bySlug = await env.BF_DB
    .prepare(`
      SELECT org_id, slug, cfg_json, updated_at
      FROM public_site_configs
      WHERE lower(slug) = 'red-harbor'
      ORDER BY updated_at DESC
      LIMIT 1
    `)
    .first();

  if (bySlug?.cfg_json) {
    try {
      return JSON.parse(bySlug.cfg_json);
    } catch {
      return {};
    }
  }

  const newest = await env.BF_DB
    .prepare(`
      SELECT org_id, slug, cfg_json, updated_at
      FROM public_site_configs
      ORDER BY updated_at DESC
      LIMIT 1
    `)
    .first();

  if (newest?.cfg_json) {
    try {
      return JSON.parse(newest.cfg_json);
    } catch {
      return {};
    }
  }

  return {};
}

function normalizePublicCfg(cfg) {
  const src = cfg && typeof cfg === "object" ? cfg : {};
  return {
    enabled: src.enabled !== false,
    newsletter_enabled: !!src.newsletter_enabled,
    pledges_enabled: src.pledges_enabled !== false,
    show_action_strip: src.show_action_strip !== false,
    show_needs: src.show_needs !== false,
    show_meetings: src.show_meetings !== false,
    show_what_we_do: src.show_what_we_do !== false,
    show_get_involved: !!src.show_get_involved,
    show_newsletter_card: !!src.show_newsletter_card,
    show_website_button: !!src.show_website_button,
    slug: String(src.slug || ""),
    title: String(src.title || ""),
    location: String(src.location || ""),
    about: String(src.about || ""),
    accent_color: String(src.accent_color || "#6d5efc"),
    theme_mode: String(src.theme_mode || "light"),
    website_link: src.website_link || null,
    meeting_rsvp_url: String(src.meeting_rsvp_url || ""),
    what_we_do: Array.isArray(src.what_we_do) ? src.what_we_do : [],
    primary_actions: Array.isArray(src.primary_actions) ? src.primary_actions : [],
    get_involved_links: Array.isArray(src.get_involved_links) ? src.get_involved_links : [],
  };
}

export async function onRequestGet({ env }) {
  try {
    const cfg = await getRedHarborCfg(env);
    return Response.json({ ok: true, public: normalizePublicCfg(cfg) });
  } catch (err) {
    console.error("public-home/red-harbor failed", err);
    return Response.json({ ok: true, public: normalizePublicCfg({}) });
  }
}
