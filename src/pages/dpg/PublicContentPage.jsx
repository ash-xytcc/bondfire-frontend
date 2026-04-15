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

function PublicNav({ links = [] }) {
  const items = Array.isArray(links) ? links : [];
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        marginBottom: 28,
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
            }}
          >
            {item?.label || ""}
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => (window.location.href = DPG_BRAND.adminSignInHref)}
        style={{
          border: 0,
          borderRadius: 999,
          padding: "12px 18px",
          background: "#f4f2eb",
          color: "#121715",
          cursor: "pointer",
          fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
          fontWeight: 800,
        }}
      >
        Organizer sign in
      </button>
    </nav>
  );
}

export default function PublicContentPage({ slug: slugProp = "" }) {
  const { config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);

  React.useEffect(() => {
    try {
      document.documentElement.dataset.app = "dpg";
      document.body.dataset.app = "dpg";
    } catch {}
    applyAppVariantToDocument();
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

  if (!page) {
    return (
      <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px 64px" }}>
          <PublicNav links={navLinks} />
          <h1 style={{ color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 900 }}>Page not found</h1>
          <p style={{ color: "#d7ddd8" }}>That public page has not been migrated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px 64px" }}>
        <PublicNav links={navLinks} />

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
                color: "#93b4f0",
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
              style={{ width: "100%", maxHeight: 460, objectFit: "cover", display: "block" }}
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
          }}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>
    </div>
  );
}
