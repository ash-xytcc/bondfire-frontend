import React from 'react';
import { applyAppVariantToDocument } from '../lib/appVariant.js';
import { getDpgPublicTheme, useDpgPublicSiteConfig } from '../lib/dpgPublicSite.js';

const DPG_BRAND = {
  name: "Dual Power West",
  shortName: "DPW",
  publicSiteTitle: "Dual Power West",
  adminSignInHref: "/?app=dpg#/signin",
  logoSrc: "/branding/dpg-logo.png",
  logoAlt: "Dual Power West",
  colors: {
    green: "#385032",
    blue: "#5f94dd",
    blueDark: "#4f7fc0",
    mist: "#dbe6f5",
    paper: "#121715",
  },
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
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          marginBottom: 10,
          color: '#171717',
          textShadow: 'none',
          fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.5,
          color: '#171717',
          textShadow: 'none',
          fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function DpgPublicHome() {
  const brand = DPG_BRAND;
  const { loading, config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);
  const dark = true;

  React.useEffect(() => {
    try {
      document.documentElement.dataset.app = "dpg";
      document.body.dataset.app = "dpg";
    } catch {}
    applyAppVariantToDocument();
  }, []);

  const stickyCards = Array.isArray(config?.sticky_cards) ? config.sticky_cards.slice(0, 4) : [];
  const progressItems = Array.isArray(config?.progress_items) ? config.progress_items : [];
  const eyebrowText = String(config?.hero_title || config?.hero_eyebrow || 'Build it together before we even arrive.').trim() || 'Build it together before we even arrive.';

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      <div style={theme.shell}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <img src={brand.logoSrc} alt={brand.logoAlt} style={{ width: 86, height: 86, objectFit: 'contain', flex: '0 0 auto' }} />
            <div>
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: '.01em',
                  marginBottom: 10,
                  color: '#f3efe8',
                  fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
                  textShadow: 'none',
                }}
              >
                {eyebrowText}
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.3rem, 6vw, 5rem)',
                  lineHeight: 0.95,
                  margin: 0,
                  color: '#f3efe8',
                  fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
                  textShadow: 'none',
                  filter: 'none',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                {brand.name}
              </h1>
            </div>
          </div>

          <button
            type="button"
            style={{
              ...theme.button,
              border: 0,
              cursor: "pointer",
              fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
            }}
            onClick={() => window.location.href = "/?app=dpg#/signin"}
          >
            Organizer login
          </button>
        </header>

        {(loading || String(config?.hero_body || '').trim()) ? (
          <section style={{ ...theme.card, marginBottom: 22, color: '#f3efe8' }}>
            {String(config?.hero_body || '').trim() ? (
              <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0, maxWidth: 860, color: '#f3efe8' }}>
                {config?.hero_body || ''}
              </p>
            ) : null}
            {loading ? <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13, color: '#d7ddd8' }}>Loading public config…</div> : null}
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
                dark={dark}
              />
            ))}
          </section>
        ) : null}

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20, alignItems: 'start' }}>
          <div style={{ ...theme.card, color: '#f3efe8' }}>
            <h2
              style={{
                marginTop: 0,
                color: '#f3efe8',
                fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
                fontWeight: 800,
              }}
            >
              What is in progress
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: '#f3efe8' }}>
              {progressItems.map((item, idx) => <li key={`${item}-${idx}`} style={{ color: '#f3efe8' }}>{item}</li>)}
            </ul>
          </div>

          <div style={{ ...theme.card, color: '#f3efe8' }}>
            <h2
              style={{
                marginTop: 0,
                color: '#f3efe8',
                fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
                fontWeight: 800,
              }}
            >
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
