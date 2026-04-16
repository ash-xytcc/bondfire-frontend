import React from 'react';
import { applyAppVariantToDocument } from '../lib/appVariant.js';
import { getDpgPublicTheme, useDpgPublicSiteConfig } from '../lib/dpgPublicSite.js';

const DPG_BRAND = {
  name: "Dual Power West",
  adminSignInHref: "/?app=dpg#/signin",
  logoSrc: "/branding/dpg-logo.png",
  logoAlt: "Dual Power West",
};

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

function NavBar({ links = [] }) {
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
            href={item?.url || '/'}
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

export default function DpgPublicHome() {
  const { loading, config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);
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

  const stickyCards = Array.isArray(config?.sticky_cards) ? config.sticky_cards.slice(0, 4) : [];
  const progressItems = Array.isArray(config?.progress_items) ? config.progress_items : [];
  const navLinks =
    Array.isArray(config?.nav_links) && config.nav_links.length
      ? config.nav_links
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
  const heroBackground = String(config?.hero_background_url || '').trim();

  const selectedSlugs = Array.isArray(config?.featured_post_slugs)
    ? config.featured_post_slugs.map((s) => String(s || '').trim()).filter(Boolean)
    : [];

  const featuredPosts = selectedSlugs.length
    ? selectedSlugs
        .map((slug) => postsState.posts.find((p) => String(p?.slug || '') === slug))
        .filter(Boolean)
    : postsState.posts.slice(0, 4);

  const eyebrowText = String(config?.hero_title || config?.hero_eyebrow || 'Build it together before we even arrive.').trim() || 'Build it together before we even arrive.';

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      <section style={{
        position: 'relative',
        minHeight: 720,
        background: heroBackground
          ? `linear-gradient(rgba(10,14,12,0.34), rgba(10,14,12,0.38)), url("${heroBackground}") center/cover no-repeat`
          : '#121715',
      }}>
        <NavBar links={navLinks} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1240,
          margin: '0 auto',
          padding: '180px 28px 110px',
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

          <div style={{
            marginTop: 26,
            color: '#ffffff',
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            lineHeight: 1.2,
            fontFamily: 'Inter, system-ui, Arial, sans-serif',
            fontWeight: 500,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}>
            {String(config?.hero_body || '').trim() || 'A gathering for learning, sharing, building, and reflection'}
          </div>

          {String(eyebrowText).trim() ? (
            <div style={{
              marginTop: 18,
              color: '#f3efe8',
              fontSize: 16,
              fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
              textShadow: '0 1px 2px rgba(0,0,0,0.45)',
            }}>
              {eyebrowText}
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
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: '#f3efe8' }}>
              {progressItems.map((item, idx) => <li key={`${item}-${idx}`} style={{ color: '#f3efe8' }}>{item}</li>)}
            </ul>
          </div>

          <div style={{ ...theme.card, color: '#f3efe8' }}>
            <h2 style={{
              marginTop: 0,
              color: '#f3efe8',
              fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
              fontWeight: 800,
            }}>
              {config?.organizer_title || 'Organizer entry'}
            </h2>
            <p style={{ marginTop: 0, lineHeight: 1.6, color: '#f3efe8' }}>
              {config?.organizer_body || ''}
            </p>
            <div style={{ display: "grid", gap: 10 }}>
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
