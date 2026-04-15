import {
  slugify,
  uniqueSlug,
  getPublicCfg,
  setPublicCfg,
  setSlugMapping,
  removeSlugMapping,
} from "../../../_lib/publicPageStore.js";

function authOk(env, request) {
  if (env.BF_WRITE_LOCKED === "true") {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ");
  }
  return true;
}

function cleanLink(value) {
  if (!value || typeof value !== "object") return null;
  const label = String(value.label || value.text || "").trim();
  const url = String(value.url || "").trim();
  if (!label || !url) return null;
  return { label, url };
}

function cleanLinks(arr, limit) {
  return Array.isArray(arr)
    ? arr.map(cleanLink).filter(Boolean).slice(0, limit)
    : [];
}

function cleanStrings(arr, limit) {
  return Array.isArray(arr)
    ? arr.map((s) => String(s || "").trim()).filter(Boolean).slice(0, limit)
    : [];
}

function normalizeSavedCfg(prev, body, slug) {
  return {
    enabled: true,
    newsletter_enabled: !!body.newsletter_enabled,
    pledges_enabled: prev?.pledges_enabled !== false,
    show_action_strip: body.show_action_strip !== false,
    show_needs: body.show_needs !== false,
    show_meetings: body.show_meetings !== false,
    show_what_we_do: body.show_what_we_do !== false,
    show_get_involved: !!body.show_get_involved,
    show_newsletter_card: !!body.show_newsletter_card,
    show_website_button: !!body.show_website_button,
    slug: String(slug || prev?.slug || ""),
    title: String(body.title || body.hero_headline || "").trim(),
    location: String(body.location || body.branch_label || "").trim(),
    about: String(body.about || body.hero_text || "").trim(),
    branch_label: String(body.branch_label || body.location || "").trim(),
    hero_headline: String(body.hero_headline || body.title || "").trim(),
    hero_text: String(body.hero_text || body.about || "").trim(),
    about_intro: String(body.about_intro || "").trim(),
    join_intro: String(body.join_intro || "").trim(),
    contact_intro: String(body.contact_intro || "").trim(),
    events_intro: String(body.events_intro || "").trim(),
    accent_color: String(body.accent_color || "#6d5efc").trim(),
    theme_mode: "light",
    website_link: cleanLink(body.website_link),
    meeting_rsvp_url: String(body.meeting_rsvp_url || "").trim(),
    what_we_do: cleanStrings(body.what_we_do, 12),
    primary_actions: cleanLinks(body.primary_actions, 3),
    get_involved_links: cleanLinks(body.get_involved_links, 4),
  };
}

export async function onRequestPost({ env, request, params }) {
  if (!authOk(env, request)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const orgId = String(params.orgId || "").trim();
    const body = await request.json().catch(() => ({}));
    const prev = await getPublicCfg(env, orgId);

    let newSlug = String(prev?.slug || "").trim();

    if (typeof body.slug === "string" && body.slug.trim()) {
      const base = slugify(body.slug);
      if (base) {
        if (prev?.slug) {
          const mappedSlug = String(prev.slug || "").trim();
          if (mappedSlug) await removeSlugMapping(env, mappedSlug);
        }
        newSlug = await uniqueSlug(env, base, orgId);
        await setSlugMapping(env, newSlug, orgId);
      }
    } else if (!newSlug) {
      const base = slugify(body.hero_headline || body.title || orgId || "org") || "org";
      newSlug = await uniqueSlug(env, base, orgId);
      await setSlugMapping(env, newSlug, orgId);
    }

    const cleaned = normalizeSavedCfg(prev, body, newSlug);
    await setPublicCfg(env, orgId, cleaned);

    return Response.json({ ok: true, public: cleaned });
  } catch (err) {
    console.error("public/save failed", err);
    return Response.json({ ok: false, error: "INTERNAL", detail: String(err?.message || err || "") }, { status: 500 });
  }
}
