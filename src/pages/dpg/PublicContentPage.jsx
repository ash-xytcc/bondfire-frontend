import React from "react";
import { applyAppVariantToDocument } from "../../lib/appVariant.js";
import { getDpgPublicTheme, useDpgPublicSiteConfig } from "../../lib/dpgPublicSite.js";
import { getDpgPublicPage } from "../../lib/dpgPublicPages.js";

const DPG_BRAND = {
  name: "Dual Power West",
  adminSignInHref: "/?app=dpg#/signin",
  logoSrc: "/branding/dpg-logo.png",
  logoAlt: "Dual Power West",
};

function PublicNav({ links = [], authed = false, accent = "#93b4f0" }) {
  const items = Array.isArray(links) ? links : [];
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        marginBottom: 34,
      }}
    >
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        {items.map((item, idx) => (
          <a
            key={`${item?.label || "nav"}-${idx}`}
            href={item?.url || "/"}
            style={{
              color: "#f3efe8",
              textDecoration: "none",
              fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
              fontWeight: 700,
              fontSize: 15,
              textShadow: "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            {item?.label || ""}
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = authed ? "/?app=dpg#/org/dpg/overview" : DPG_BRAND.adminSignInHref;
        }}
        style={{
          border: 0,
          borderRadius: 999,
          padding: "12px 18px",
          background: accent,
          color: "#121715",
          cursor: "pointer",
          fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
          fontWeight: 800,
          boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
        }}
      >
        {authed ? "Organizer area" : "Organizer sign in"}
      </button>
    </nav>
  );
}

function AboutHero({ page, accent }) {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 20,
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      <img
        src={DPG_BRAND.logoSrc}
        alt={DPG_BRAND.logoAlt}
        style={{
          width: 84,
          height: 84,
          objectFit: "contain",
          filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.22))",
        }}
      />
      <div>
        {page.eyebrow ? (
          <div
            style={{
              color: "#d7ddd8",
              marginBottom: 10,
              fontSize: 15,
            }}
          >
            {page.eyebrow}
          </div>
        ) : null}
        <h1
          style={{
            margin: 0,
            color: accent,
            fontSize: "clamp(2.6rem, 6vw, 5.4rem)",
            lineHeight: 0.95,
            fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {page.title}
        </h1>
        <p
          style={{
            margin: "14px 0 0",
            color: "#f3efe8",
            fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
            lineHeight: 1.2,
            maxWidth: 840,
            fontFamily: "Inter, system-ui, Arial, sans-serif",
            fontWeight: 500,
          }}
        >
          a gathering for learning, sharing, building, and reflection
        </p>
      </div>
    </header>
  );
}

function AboutPageLayout({ page, theme, accent }) {
  return (
    <>
      <style>{`
        .dpg-about-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
          gap: 22px;
          align-items: start;
        }

        .dpg-about-card {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)),
            rgba(10,16,14,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 24px 24px 22px;
          box-shadow: 0 18px 42px rgba(0,0,0,0.16);
          transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
        }

        .dpg-about-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.14);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02)),
            rgba(10,16,14,0.78);
        }

        .dpg-about-card h2 {
          margin: 0 0 12px;
          color: #f3efe8;
          font-family: Inter, system-ui, Arial, sans-serif;
          font-size: 1.05rem;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .dpg-about-kicker {
          margin-bottom: 10px;
          color: ${accent};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dpg-about-card p {
          margin: 0;
          color: #f3efe8;
          line-height: 1.72;
          font-size: 1.06rem;
        }

        .dpg-about-side {
          display: grid;
          gap: 18px;
        }

        .dpg-about-quote {
          position: relative;
          overflow: hidden;
        }

        .dpg-about-quote::before {
          content: "";
          position: absolute;
          left: 18px;
          top: 18px;
          bottom: 18px;
          width: 3px;
          border-radius: 999px;
          background: ${accent};
          opacity: 0.9;
        }

        .dpg-about-quote p {
          padding-left: 18px;
          font-size: 1.14rem;
          line-height: 1.58;
        }

        .dpg-about-meta {
          display: grid;
          gap: 14px;
        }

        .dpg-about-meta-row {
          display: grid;
          gap: 4px;
        }

        .dpg-about-meta-label {
          color: ${accent};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dpg-about-meta-value {
          color: #f3efe8;
          line-height: 1.58;
        }

        .dpg-about-sticky {
          background: #f3e28b;
          color: #171717;
          border-radius: 16px;
          padding: 18px;
          transform: rotate(1.2deg);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 18px 36px rgba(0,0,0,0.16);
        }

        .dpg-about-sticky h3 {
          margin: 0 0 8px;
          color: #171717;
          font-family: Inter, system-ui, Arial, sans-serif;
          font-size: 1rem;
          line-height: 1.1;
          font-weight: 800;
        }

        .dpg-about-sticky p {
          margin: 0;
          color: #171717;
          line-height: 1.56;
          font-size: 0.98rem;
        }

        .dpg-about-prose,
        .dpg-about-prose p,
        .dpg-about-prose li,
        .dpg-about-prose blockquote,
        .dpg-about-prose strong,
        .dpg-about-prose em,
        .dpg-about-prose span,
        .dpg-about-prose a {
          color: #f3efe8;
        }

        .dpg-about-prose a {
          color: ${accent};
          text-decoration: underline;
        }

        @media (max-width: 880px) {
          .dpg-about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <AboutHero page={page} accent={accent} />

      <section className="dpg-about-grid">
        <div style={{ display: "grid", gap: 18 }}>
          <article className="dpg-about-card">
            <div className="dpg-about-kicker">What this is</div>
            <h2>a gathering, not a performance</h2>
            <p>
              Dual Power West is a gathering for learning, sharing, building, and reflection
              across anti authoritarian and anti capitalist movements.
            </p>
          </article>

          <article className="dpg-about-card">
            <div className="dpg-about-kicker">What we value</div>
            <h2>trust, courage, and practical capacity</h2>
            <p>
              We are building a space for trust, skill sharing, solidarity, and collective
              exploration. The point is not polished conference culture. The point is
              relationships, courage, and practical capacity.
            </p>
          </article>

          <article className="dpg-about-card">
            <div className="dpg-about-kicker">How it works</div>
            <h2>public front door, private organizer tools</h2>
            <p>
              This public site is the front door. Organizer tools, internal logistics, and
              planning live behind sign in.
            </p>
          </article>
        </div>

        <aside className="dpg-about-side">
          <div className="dpg-about-card dpg-about-quote">
            <div className="dpg-about-kicker">Why this exists</div>
            <p>this is not a conference. it is a practice.</p>
          </div>

          <div className="dpg-about-card dpg-about-meta">
            <div className="dpg-about-meta-row">
              <div className="dpg-about-meta-label">Structure</div>
              <div className="dpg-about-meta-value">
                participant shaped, organizer supported, movement rooted
              </div>
            </div>

            <div className="dpg-about-meta-row">
              <div className="dpg-about-meta-label">Purpose</div>
              <div className="dpg-about-meta-value">
                build stronger relationships, sharper skills, and more durable forms of
                collective power
              </div>
            </div>

            <div className="dpg-about-meta-row">
              <div className="dpg-about-meta-label">Orientation</div>
              <div className="dpg-about-meta-value">
                anti authoritarian, anti capitalist, practical, collaborative
              </div>
            </div>
          </div>

          <div className="dpg-about-sticky">
            <h3>come build something with us</h3>
            <p>
              the goal is not polish. the goal is that people leave more connected,
              more capable, and more ready to act together.
            </p>
          </div>
        </aside>
      </section>

      {page.html ? (
        <section style={{ marginTop: 26 }}>
          <details
            style={{
              ...theme.articleCard,
              borderRadius: 22,
              color: "#f3efe8",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                color: accent,
                fontFamily: "Inter, system-ui, Arial, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              original page copy
            </summary>
            <article
              className="dpg-about-prose"
              style={{
                marginTop: 16,
                lineHeight: 1.7,
              }}
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </details>
        </section>
      ) : null}
    </>
  );
}

export default function PublicContentPage({ slug: slugProp = "" }) {
  const { config } = useDpgPublicSiteConfig();
  const [authState, setAuthState] = React.useState({ checked: false, authed: false });
  const theme = getDpgPublicTheme(config);

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
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (dead) return;
        setAuthState({ checked: true, authed: !!(res.ok && data?.ok) });
      } catch {
        if (dead) return;
        setAuthState({ checked: true, authed: false });
      }
    })();
    return () => { dead = true; };
  }, []);

  const slug = React.useMemo(() => {
    if (slugProp) return slugProp;
    const path = String(window.location.pathname || "/")
      .split("/")
      .filter(Boolean);
    return String(path[0] || "").trim().toLowerCase();
  }, [slugProp]);

  const page = getDpgPublicPage(slug);

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

  const accent = String(config?.accent_color || "#93b4f0").trim() || "#93b4f0";

  if (!page) {
    return (
      <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 72px" }}>
          <PublicNav links={navLinks} authed={authState.authed} accent={accent} />
          <h1 style={{ color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 900 }}>
            Page not found
          </h1>
          <p style={{ color: "#d7ddd8" }}>That public page has not been migrated yet.</p>
        </div>
      </div>
    );
  }

  if (slug === "about") {
    return (
      <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 20px 80px" }}>
          <PublicNav links={navLinks} authed={authState.authed} accent={accent} />
          <AboutPageLayout page={page} theme={theme} accent={accent} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px 64px" }}>
        <PublicNav links={navLinks} authed={authState.authed} accent={accent} />

        <header style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, flexWrap: "wrap" }}>
          <img src={DPG_BRAND.logoSrc} alt={DPG_BRAND.logoAlt} style={{ width: 72, height: 72, objectFit: "contain" }} />
          <div>
            {page.eyebrow ? (
              <div style={{ color: "#d7ddd8", marginBottom: 8, fontSize: 15 }}>
                {page.eyebrow}
              </div>
            ) : null}
            <h1
              style={{
                margin: 0,
                color: accent,
                fontSize: "clamp(2.1rem, 4.5vw, 4.8rem)",
                lineHeight: 1,
                fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              {page.title}
            </h1>
          </div>
        </header>

        {page.featureImage ? (
          <div style={{ marginBottom: 28 }}>
            <img
              src={page.featureImage}
              alt={page.title}
              style={{ width: "100%", maxHeight: 460, objectFit: "cover", display: "block", borderRadius: 22 }}
            />
          </div>
        ) : null}

        <style>{`
          .dpg-public-content,
          .dpg-public-content p,
          .dpg-public-content li,
          .dpg-public-content blockquote,
          .dpg-public-content strong,
          .dpg-public-content em,
          .dpg-public-content span,
          .dpg-public-content a {
            color: #f3efe8;
          }

          .dpg-public-content h1,
          .dpg-public-content h2,
          .dpg-public-content h3,
          .dpg-public-content h4,
          .dpg-public-content h5,
          .dpg-public-content h6 {
            color: #f3efe8;
            font-family: Inter, system-ui, Arial, sans-serif;
            font-weight: 800;
            line-height: 1.15;
            margin-top: 1.25em;
          }

          .dpg-public-content a {
            color: ${accent};
            text-decoration: underline;
          }

          .dpg-public-content ul,
          .dpg-public-content ol {
            padding-left: 1.4em;
          }

          .dpg-public-content blockquote {
            border-left: 3px solid rgba(255,255,255,0.2);
            padding-left: 1em;
            margin-left: 0;
          }
        `}</style>

        <article
          className="dpg-public-content"
          style={{
            ...theme.articleCard,
            color: "#f3efe8",
            lineHeight: 1.7,
            borderRadius: 24,
          }}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>
    </div>
  );
}
