import React from 'react';
import { applyAppVariantToDocument } from '../lib/appVariant.js';
import { getDpgPublicTheme, useDpgPublicSiteConfig } from '../lib/dpgPublicSite.js';

const DPG_BRAND = {
  name: "Dual Power West",
  adminSignInHref: "/?app=dpg#/signin",
  logoSrc: "/branding/dpg-logo.png",
  logoAlt: "Dual Power West",
};

function InlineTextEditor({ value, onChange, className = "", style = {}, placeholder = "", multiline = false }) {
  if (multiline) {
    return (
      <textarea
        className={className}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight: 72,
          resize: "vertical",
          background: "rgba(255,255,255,0.08)",
          color: "#f3efe8",
          border: "1px dashed rgba(255,255,255,0.24)",
          padding: 10,
          font: "inherit",
          ...style,
        }}
      />
    );
  }
  return (
    <input
      className={className}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.08)",
        color: "#f3efe8",
        border: "1px dashed rgba(255,255,255,0.24)",
        padding: 10,
        font: "inherit",
        ...style,
      }}
    />
  );
}

function InlineStringListEditor({ title, items, onChange, limit = 6, itemPlaceholder = "Item", light = true }) {
  const safe = Array.isArray(items) ? items.slice(0, limit) : [];
  while (safe.length < limit) safe.push("");

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {title ? <div style={{ color: light ? "#8fa1ab" : "#555", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</div> : null}
      {safe.map((item, index) => (
        <input
          key={`${title || "item"}-${index}`}
          value={item || ""}
          onChange={(e) => {
            const next = safe.map((x, i) => i === index ? e.target.value : x).map((x) => String(x || "").trimEnd());
            onChange(next.filter((x) => x.trim()));
          }}
          placeholder={`${itemPlaceholder} ${index + 1}`}
          style={{
            width: "100%",
            background: light ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            color: light ? "#f3efe8" : "#171717",
            border: light ? "1px dashed rgba(255,255,255,0.24)" : "1px dashed rgba(0,0,0,0.18)",
            padding: 10,
          }}
        />
      ))}
    </div>
  );
}

function InlineCardBlockEditor({ items, onChange, editorMode }) {
  if (!editorMode) return null;
  const safe = Array.isArray(items) ? items.slice(0, 4) : [];
  while (safe.length < 4) safe.push({ title: "", text: "", tone: "#f3e28b" });

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {safe.map((item, index) => (
        <div key={`sticky-${index}`} style={{ padding: 12, border: "1px dashed rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.04)" }}>
          <div style={{ color: "#8fa1ab", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Sticky note {index + 1}</div>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              value={item.title || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === index ? { ...x, title: e.target.value } : x);
                onChange(next.filter((x) => x.title || x.text));
              }}
              placeholder="Title"
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", color: "#f3efe8", border: "1px dashed rgba(255,255,255,0.24)", padding: 10 }}
            />
            <textarea
              rows={3}
              value={item.text || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === index ? { ...x, text: e.target.value } : x);
                onChange(next.filter((x) => x.title || x.text));
              }}
              placeholder="Text"
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", color: "#f3efe8", border: "1px dashed rgba(255,255,255,0.24)", padding: 10, resize: "vertical" }}
            />
            <input
              value={item.tone || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === index ? { ...x, tone: e.target.value } : x);
                onChange(next.filter((x) => x.title || x.text));
              }}
              placeholder="#f3e28b"
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", color: "#f3efe8", border: "1px dashed rgba(255,255,255,0.24)", padding: 10 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InlineNavEditor({ links, onChange, editorMode }) {
  if (!editorMode) return null;
  const safe = Array.isArray(links) ? links.slice(0, 8) : [];
  while (safe.length < 8) safe.push({ label: "", url: "" });

  return (
    <div style={{ position: "absolute", top: 82, left: 28, zIndex: 4, width: "min(720px, calc(100% - 56px))", display: "grid", gap: 8 }}>
      <div style={{ color: "#d7ddd8", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>Top navigation</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {safe.map((item, idx) => (
          <React.Fragment key={`nav-${idx}`}>
            <input
              value={item.label || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === idx ? { ...x, label: e.target.value } : x);
                onChange(next.filter((x) => x.label && x.url));
              }}
              placeholder={`Label ${idx + 1}`}
              style={{ background: "rgba(0,0,0,0.38)", color: "#fff", border: "1px dashed rgba(255,255,255,0.25)", padding: 8 }}
            />
            <input
              value={item.url || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === idx ? { ...x, url: e.target.value } : x);
                onChange(next.filter((x) => x.label && x.url));
              }}
              placeholder={`/${idx === 0 ? "" : "route"}`}
              style={{ background: "rgba(0,0,0,0.38)", color: "#fff", border: "1px dashed rgba(255,255,255,0.25)", padding: 8 }}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Sticky({ title, text, rotate = '-1deg', tone = '#fff7a8', dark = false }) {
  return (
    <div style={{
      background: tone,
      color: '#171717',
      borderRadius: 10,
      padding: 16,
      minHeight: 150,
      boxShadow: dark ? '0 12px 24px rgba(0,0,0,0.22)' : '0 12px 24px rgba(0,0,0,0.10)',
      transform: `rotate(${rotate})`,
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 800,
        marginBottom: 10,
        color: '#171717',
        textShadow: 'none',
        fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 14,
        lineHeight: 1.5,
        color: '#171717',
        textShadow: 'none',
        fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
      }}>
        {text}
      </div>
    </div>
  );
}

function NavBar({ links = [], editorMode = false }) {
  const items = Array.isArray(links) ? links : [];
  return (
    <nav style={{
      position: 'absolute',
      top: 22,
      left: 28,
      right: 28,
      zIndex: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 18,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {items.map((item, idx) => (
          <a
            key={`${item?.label || 'nav'}-${idx}`}
            href={editorMode ? "#" : (item?.url || '/')}
            onClick={editorMode ? (e) => e.preventDefault() : undefined}
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
              fontWeight: 700,
              fontSize: 15,
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {item?.label || ''}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => window.location.href = DPG_BRAND.adminSignInHref}
          style={{
            border: 0,
            borderRadius: 999,
            padding: '12px 18px',
            background: '#f4f2eb',
            color: '#121715',
            cursor: 'pointer',
            fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
            fontWeight: 800,
          }}
        >
          Organizer sign in
        </button>
      </div>
    </nav>
  );
}

function FeaturedCard({ post, reverse = false }) {
  const href = `/bulletin/${encodeURIComponent(post.slug)}`;
  return (
    <a
      href={href}
      style={{
        display: 'grid',
        gridTemplateColumns: reverse ? '1.35fr .9fr' : '.9fr 1.35fr',
        gap: 26,
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        background: 'transparent',
      }}
    >
      <div style={{ order: reverse ? 2 : 1 }}>
        <h2 style={{
          margin: 0,
          fontSize: 'clamp(2rem, 4vw, 3.3rem)',
          lineHeight: 0.95,
          color: '#f3efe8',
          fontFamily: 'Inter, system-ui, Arial, sans-serif',
          fontWeight: 900,
        }}>
          {post.title}
        </h2>
        {post.excerpt ? (
          <p style={{
            margin: '16px 0 10px',
            color: '#d7ddd8',
            lineHeight: 1.55,
            fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
          }}>
            {post.excerpt}
          </p>
        ) : null}
        <div style={{
          color: '#8fa1ab',
          fontSize: 13,
          fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
        }}>
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
        </div>
      </div>

      <div style={{
        order: reverse ? 1 : 2,
        minHeight: 260,
        borderRadius: 0,
        overflow: 'hidden',
        background: '#1a211e',
      }}>
        {post.feature_image || post.featureImage ? (
          <img
            src={post.feature_image || post.featureImage}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', minHeight: 260, background: '#1a211e' }} />
        )}
      </div>
    </a>
  );
}

export default function DpgPublicHome({
  editorMode = false,
  liveHome = null,
  updateDraft = () => {},
  saveDraft = () => {},
  cancelEditing = () => {},
  saveBusy = false,
  saveMsg = "",
}) {
  const { config } = useDpgPublicSiteConfig();
  const liveConfig = liveHome || config || {};
  const theme = getDpgPublicTheme(liveConfig);
  const [postsState, setPostsState] = React.useState({ loading: true, posts: [], error: "" });

  React.useEffect(() => {
    try {
      document.documentElement.dataset.app = "dpg";
      document.body.dataset.app = "dpg";
    } catch {}
    applyAppVariantToDocument();
  }, []);

  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const res = await fetch("/api/public/posts?org=dpg", { headers: { Accept: "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (dead) return;
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load posts");
        const posts = (Array.isArray(data.posts) ? data.posts : []).map((post) => ({
          ...post,
          publishedAt: post?.publishedAt || post?.published_at || "",
          featureImage: post?.featureImage || post?.feature_image || "",
          feature_image: post?.feature_image || post?.featureImage || "",
        }));
        setPostsState({ loading: false, posts, error: "" });
      } catch (e) {
        if (dead) return;
        setPostsState({ loading: false, posts: [], error: String(e?.message || e) });
      }
    })();
    return () => { dead = true; };
  }, []);

  const stickyCards = Array.isArray(liveConfig?.sticky_cards) ? liveConfig.sticky_cards.slice(0, 4) : [];
  const progressItems = Array.isArray(liveConfig?.progress_items) ? liveConfig.progress_items : [];
  const navLinks =
    Array.isArray(liveConfig?.nav_links) && liveConfig.nav_links.length
      ? liveConfig.nav_links
      : [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "FAQ", url: "/faq" },
          { label: "Volunteer", url: "/volunteer" },
          { label: "Donate", url: "/donate" },
          { label: "Press", url: "/press" },
          { label: "DPG Shares", url: "/bulletin" },
          { label: "RSVP", url: "/rsvp" },
        ];
  const heroBackground = String(liveConfig?.hero_background_url || '').trim();

  const selectedSlugs = Array.isArray(liveConfig?.featured_post_slugs)
    ? liveConfig.featured_post_slugs.map((s) => String(s || '').trim()).filter(Boolean)
    : [];

  const featuredPosts = selectedSlugs.length
    ? selectedSlugs
        .map((slug) => postsState.posts.find((p) => String(p?.slug || '') === slug))
        .filter(Boolean)
    : postsState.posts.slice(0, 4);

  const eyebrowText = String(liveConfig?.hero_title || liveConfig?.hero_eyebrow || 'Build it together before we even arrive.').trim() || 'Build it together before we even arrive.';
  const heroSubheading = String(liveConfig?.hero_body || '').trim() || 'A gathering for learning, sharing, building, and reflection';
  const accent = String(liveConfig?.accent_color || "#385032").trim() || "#385032";

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      {editorMode ? (
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "12px 18px",
          background: "rgba(10,14,12,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ color: "#f3efe8" }}>Editor mode</strong>
            <span style={{ color: "#8fa1ab", fontSize: 13 }}>
              Inline live editing for homepage copy, cards, nav, and accent color.
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#d7ddd8" }}>
              <span>Accent</span>
              <input
                type="color"
                value={accent}
                onChange={(e) => updateDraft("accent_color", e.target.value)}
              />
            </label>
            {saveMsg ? <span className={saveMsg.includes("Saved") ? "success" : "error"}>{saveMsg}</span> : null}
            <button type="button" className="btn" onClick={cancelEditing} disabled={saveBusy}>
              Cancel
            </button>
            <button type="button" className="btn-red" onClick={saveDraft} disabled={saveBusy}>
              {saveBusy ? "Saving…" : "Save and publish"}
            </button>
          </div>
        </div>
      ) : null}

      <section style={{
        position: 'relative',
        minHeight: 720,
        background: heroBackground
          ? `linear-gradient(rgba(10,14,12,0.34), rgba(10,14,12,0.38)), url("${heroBackground}") center/cover no-repeat`
          : '#121715',
      }}>
        <NavBar links={navLinks} editorMode={editorMode} />
        <InlineNavEditor links={navLinks} onChange={(next) => updateDraft("nav_links", next)} editorMode={editorMode} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1240,
          margin: '0 auto',
          padding: editorMode ? '260px 28px 110px' : '180px 28px 110px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 26,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <img
              src={DPG_BRAND.logoSrc}
              alt={DPG_BRAND.logoAlt}
              style={{ width: 86, height: 86, objectFit: 'contain' }}
            />
            <h1 style={{
              margin: 0,
              color: '#93b4f0',
              fontSize: 'clamp(2.4rem, 5.5vw, 5.8rem)',
              lineHeight: 1,
              fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
              textShadow: '0 1px 2px rgba(0,0,0,0.35)',
              WebkitTextStroke: '0.35px rgba(220,230,255,0.45)',
            }}>
              {DPG_BRAND.name}
            </h1>
            <img
              src={DPG_BRAND.logoSrc}
              alt=""
              aria-hidden="true"
              style={{ width: 86, height: 86, objectFit: 'contain' }}
            />
          </div>

          <div style={{ marginTop: 26 }}>
            {editorMode ? (
              <InlineTextEditor
                value={heroSubheading}
                onChange={(v) => updateDraft("hero_body", v)}
                multiline
                style={{
                  maxWidth: 820,
                  margin: "0 auto",
                  textAlign: "center",
                  fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                  lineHeight: 1.2,
                  fontFamily: 'Inter, system-ui, Arial, sans-serif',
                  fontWeight: 500,
                }}
              />
            ) : (
              <div style={{
                color: '#ffffff',
                fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
                lineHeight: 1.2,
                fontFamily: 'Inter, system-ui, Arial, sans-serif',
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}>
                {heroSubheading}
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            {editorMode ? (
              <InlineTextEditor
                value={eyebrowText}
                onChange={(v) => updateDraft("hero_title", v)}
                style={{
                  maxWidth: 760,
                  margin: "0 auto",
                  textAlign: "center",
                  fontSize: 16,
                }}
              />
            ) : (
              String(eyebrowText).trim() ? (
                <div style={{
                  color: '#f3efe8',
                  fontSize: 16,
                  fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                }}>
                  {eyebrowText}
                </div>
              ) : null
            )}
          </div>

          {editorMode ? (
            <div style={{ marginTop: 16, maxWidth: 760, marginInline: "auto" }}>
              <InlineTextEditor
                value={heroBackground}
                onChange={(v) => updateDraft("hero_background_url", v)}
                placeholder="Hero background image URL"
              />
            </div>
          ) : null}
        </div>
      </section>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 72px' }}>
        <section style={{ display: 'grid', gap: 34, marginBottom: 42 }}>
          {postsState.loading ? <div style={{ color: '#d7ddd8' }}>Loading featured posts…</div> : null}
          {postsState.error ? <div style={{ color: 'crimson' }}>{postsState.error}</div> : null}
          {featuredPosts.map((post, idx) => (
            <FeaturedCard key={post.slug || idx} post={post} reverse={idx % 2 === 1} />
          ))}
        </section>

        {editorMode ? (
          <section style={{ marginBottom: 26 }}>
            <InlineStringListEditor
              title="Featured post slugs"
              items={selectedSlugs}
              onChange={(items) => updateDraft("featured_post_slugs", items)}
              limit={4}
              itemPlaceholder="featured-post-slug"
            />
          </section>
        ) : null}

        {stickyCards.length ? (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 26 }}>
            {stickyCards.map((card, idx) => (
              <Sticky
                key={`${card?.title || 'card'}-${idx}`}
                title={card?.title || ''}
                text={card?.text || ''}
                tone={card?.tone || '#f3e28b'}
                rotate={['-2deg', '1.5deg', '-1deg', '2deg'][idx] || '-1deg'}
                dark={true}
              />
            ))}
          </section>
        ) : null}

        {editorMode ? (
          <section style={{ marginBottom: 28 }}>
            <InlineCardBlockEditor
              items={stickyCards}
              onChange={(items) => updateDraft("sticky_cards", items)}
              editorMode={editorMode}
            />
          </section>
        ) : null}

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20, alignItems: 'start' }}>
          <div style={{ ...theme.card, color: '#f3efe8' }}>
            <h2 style={{
              marginTop: 0,
              color: '#f3efe8',
              fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
              fontWeight: 800,
            }}>
              What is in progress
            </h2>
            {editorMode ? (
              <InlineStringListEditor
                items={progressItems}
                onChange={(items) => updateDraft("progress_items", items)}
                limit={8}
                itemPlaceholder="Progress item"
              />
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: '#f3efe8' }}>
                {progressItems.map((item, idx) => <li key={`${item}-${idx}`} style={{ color: '#f3efe8' }}>{item}</li>)}
              </ul>
            )}
          </div>

          <div style={{ ...theme.card, color: '#f3efe8' }}>
            {editorMode ? (
              <>
                <InlineTextEditor
                  value={String(liveConfig?.organizer_title || '')}
                  onChange={(v) => updateDraft("organizer_title", v)}
                  placeholder="Organizer card title"
                  style={{ marginBottom: 10, fontWeight: 800 }}
                />
                <InlineTextEditor
                  value={String(liveConfig?.organizer_body || '')}
                  onChange={(v) => updateDraft("organizer_body", v)}
                  placeholder="Organizer card body"
                  multiline
                />
              </>
            ) : (
              <>
                <h2 style={{
                  marginTop: 0,
                  color: '#f3efe8',
                  fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
                  fontWeight: 800,
                }}>
                  {liveConfig?.organizer_title || 'Organizer entry'}
                </h2>
                <p style={{ marginTop: 0, lineHeight: 1.6, color: '#f3efe8' }}>
                  {liveConfig?.organizer_body || ''}
                </p>
              </>
            )}
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <a href="/bulletin" style={{ ...theme.link, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>Read public bulletin</a>
              <button
                type="button"
                style={{ ...theme.link, background: 'transparent', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}
                onClick={() => window.location.href = "/?app=dpg#/signin"}
              >
                Go to admin sign-in
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
