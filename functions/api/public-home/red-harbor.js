import { getPublicCfg, resolveSlug } from "../_lib/publicPageStore.js";

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
    branch_label: String(src.branch_label || ""),
    hero_headline: String(src.hero_headline || ""),
    hero_text: String(src.hero_text || ""),
    about_intro: String(src.about_intro || ""),
    purpose_title: String(src.purpose_title || ""),
    about_title: String(src.about_title || ""),
    join_title: String(src.join_title || ""),
    bulletin_title: String(src.bulletin_title || ""),
    events_title: String(src.events_title || ""),
    contact_title: String(src.contact_title || ""),
    join_intro: String(src.join_intro || ""),
    contact_intro: String(src.contact_intro || ""),
    events_intro: String(src.events_intro || ""),
    font_family: String(src.font_family || src.fontFamily || "system"),
    accent_color: String(src.accent_color || "#6d5efc"),
    theme_mode: String(src.theme_mode || "light"),
    website_link: src.website_link || null,
    meeting_rsvp_url: String(src.meeting_rsvp_url || ""),
    what_we_do: Array.isArray(src.what_we_do) ? src.what_we_do : [],
    site_purpose_items: Array.isArray(src.site_purpose_items) ? src.site_purpose_items : [],
    join_cards: Array.isArray(src.join_cards) ? src.join_cards : [],
    events_items: Array.isArray(src.events_items) ? src.events_items : [],
    contact_card_title: String(src.contact_card_title || ""),
    contact_card_body: String(src.contact_card_body || ""),
    member_access_title: String(src.member_access_title || ""),
    member_access_body: String(src.member_access_body || ""),
    primary_actions: Array.isArray(src.primary_actions) ? src.primary_actions : [],
    get_involved_links: Array.isArray(src.get_involved_links) ? src.get_involved_links : [],
  };
}

export async function onRequestGet({ env }) {
  try {
    let cfg = await getPublicCfg(env, "red-harbor");

    if (!cfg || !Object.keys(cfg).length) {
      const slugOrgId = await resolveSlug(env, "red-harbor");
      if (slugOrgId) {
        cfg = await getPublicCfg(env, String(slugOrgId).trim());
      }
    }

    return Response.json({
      ok: true,
      route_version: "red-harbor-public-home-v2",
      public: normalizePublicCfg(cfg),
    });
  } catch (err) {
    console.error("public-home/red-harbor failed", err);
    return Response.json({
      ok: true,
      route_version: "red-harbor-public-home-v2",
      public: normalizePublicCfg({}),
    });
  }
}
