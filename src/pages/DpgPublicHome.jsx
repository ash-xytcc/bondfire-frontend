import React from 'react';
import { applyAppVariantToDocument, getBranding } from '../lib/appVariant.js';
import { getDpgPublicTheme, useDpgPublicSiteConfig } from '../lib/dpgPublicSite.js';
import PublicBulletinIndex from './dpg/PublicBulletinIndex.jsx';
import PublicBulletinPost from './dpg/PublicBulletinPost.jsx';

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
      <div className="dpg-heading" style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

export default function DpgPublicHome() {
  const brand = getBranding();
  const pathname = typeof window !== "undefined" ? window.location.pathname || "/" : "/";
  const { loading, config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);
  const dark = String(config?.theme_mode || "light") === "dark";

  React.useEffect(() => {
    try {
      document.documentElement.dataset.app = "dpg";
      document.body.dataset.app = "dpg";
    } catch {}
    applyAppVariantToDocument();
  }, []);

  if (pathname === "/bulletin" || pathname === "/bulletin/") return <PublicBulletinIndex />;
  if (/^\/bulletin\/.+/.test(pathname)) return <PublicBulletinPost />;

  const stickyCards = Array.isArray(config?.sticky_cards) ? config.sticky_cards.slice(0, 4) : [];
  const progressItems = Array.isArray(config?.progress_items) ? config.progress_items : [];

  return (
    <div style={theme.page}>
      <div style={theme.shell}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <img src={brand.logoSrc} alt={brand.logoAlt} style={{ width: 86, height: 86, objectFit: 'contain', flex: '0 0 auto' }} />
            <div>
              <div style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
                {config?.hero_eyebrow || 'Dual Power West'}
              </div>
              <h1 className="dpg-heading" style={{ fontSize: 'clamp(2.3rem, 6vw, 5rem)', lineHeight: 0.95, margin: 0 }}>
                {config?.hero_title || 'Build it together before we even arrive.'}
              </h1>
            </div>
          </div>
          <button
            type="button"
            style={{ ...theme.button, border: 0, cursor: "pointer" }}
            onClick={() => window.location.href = "/?app=dpg#/signin"}
          >
            Organizer login
          </button>
        </header>

        <section style={{ ...theme.card, marginBottom: 22 }}>
          <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0, maxWidth: 860, color: dark ? '#f3efe8' : '#171717' }}>
            {config?.hero_body || ''}
          </p>
          {loading ? <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>Loading public config…</div> : null}
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
                dark={dark}
              />
            ))}
          </section>
        ) : null}

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20, alignItems: 'start' }}>
          <div style={{ ...theme.card, color: '#f3efe8' }}>
            <h2 className="dpg-heading" style={{ marginTop: 0, color: '#f3efe8' }}>What is in progress</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: '#f3efe8' }}>
              {progressItems.map((item, idx) => <li key={`${item}-${idx}`} style={{ color: '#f3efe8' }}>{item}</li>)}
            </ul>
          </div>

          <div style={theme.card}>
            <h2 className="dpg-heading" style={{ marginTop: 0, color: "#f3efe8" }}>
              {config?.organizer_title || 'Organizer entry'}
            </h2>
            <p style={{ marginTop: 0, lineHeight: 1.6, color: "#f3efe8" }}>
              {config?.organizer_body || ''}
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <a href="/bulletin" style={theme.link}>Read public bulletin</a>
              <button
                type="button"
                style={{ ...theme.link, background: 'transparent', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer' }}
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
