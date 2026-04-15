import { getPublicCfg } from "../_lib/publicPageStore.js"

export async function onRequestGet({ env, params }) {
  const orgId = String(params.orgId || "").trim()

  if (!orgId) {
    return Response.json({ ok: false, error: "MISSING_ORG_ID" }, { status: 400 })
  }

  const cfg = await getPublicCfg(env, orgId)

  const cleaned = {
    enabled: !!cfg?.enabled,
    newsletter_enabled: !!cfg?.newsletter_enabled,
    pledges_enabled: cfg?.pledges_enabled !== false,
    show_action_strip: cfg?.show_action_strip !== false,
    show_needs: cfg?.show_needs !== false,
    show_meetings: cfg?.show_meetings !== false,
    show_what_we_do: cfg?.show_what_we_do !== false,
    show_get_involved: !!cfg?.show_get_involved,
    show_newsletter_card: !!cfg?.show_newsletter_card,
    show_website_button: !!cfg?.show_website_button,
    slug: String(cfg?.slug || ""),
    title: String(cfg?.title || ""),
    location: String(cfg?.location || ""),
    about: String(cfg?.about || ""),
    branch_label: String(cfg?.branch_label || ""),
    hero_headline: String(cfg?.hero_headline || ""),
    hero_text: String(cfg?.hero_text || ""),
    about_intro: String(cfg?.about_intro || ""),
    join_intro: String(cfg?.join_intro || ""),
    contact_intro: String(cfg?.contact_intro || ""),
    events_intro: String(cfg?.events_intro || ""),
    accent_color: String(cfg?.accent_color || "#6d5efc"),
    theme_mode: String(cfg?.theme_mode || "light"),
    website_link: cfg?.website_link || null,
    meeting_rsvp_url: String(cfg?.meeting_rsvp_url || ""),
    what_we_do: Array.isArray(cfg?.what_we_do) ? cfg.what_we_do : [],
    site_purpose_items: Array.isArray(cfg?.site_purpose_items) ? cfg.site_purpose_items : [],
    join_cards: Array.isArray(cfg?.join_cards) ? cfg.join_cards : [],
    events_items: Array.isArray(cfg?.events_items) ? cfg.events_items : [],
    contact_card_title: String(cfg?.contact_card_title || ""),
    contact_card_body: String(cfg?.contact_card_body || ""),
    member_access_title: String(cfg?.member_access_title || ""),
    member_access_body: String(cfg?.member_access_body || ""),
    primary_actions: Array.isArray(cfg?.primary_actions) ? cfg.primary_actions : [],
    get_involved_links: Array.isArray(cfg?.get_involved_links) ? cfg.get_involved_links : [],
  }

  return Response.json({ ok: true, orgId, public: cleaned })
}
