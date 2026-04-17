import { getPublicCfg } from "../../../_lib/publicPageStore.js";

function authOk(env, request) {
  if (env.BF_WRITE_LOCKED === "true") {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ");
  }
  return true;
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
    branch_label: String(src.branch_label || ""),
    hero_headline: String(src.hero_headline || ""),
    hero_text: String(src.hero_text || ""),
    about_intro: String(src.about_intro || ""),
    join_intro: String(src.join_intro || ""),
    contact_intro: String(src.contact_intro || ""),
    events_intro: String(src.events_intro || ""),
    font_family: String(src.font_family || "system"),
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

export async function onRequestGet({ env, request, params }) {
  if (!authOk(env, request)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const orgId = String(params.orgId || "").trim();
    const cfg = await getPublicCfg(env, orgId);
    return Response.json({ ok: true, public: normalizePublicCfg(cfg) });
  } catch (err) {
    console.error("public/get failed", err);
    return Response.json({
      ok: true,
      public: normalizePublicCfg({}),
      warning: "PUBLIC_GET_FALLBACK",
    });
  }
}
