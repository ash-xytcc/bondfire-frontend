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

function authFetch(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  return fetch(path, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) {
      throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    }
    return data;
  });
}

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

function EditChip({ onClick, children, subtle = false, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active
          ? "1px solid rgba(255,255,255,0.28)"
          : "1px solid rgba(255,255,255,0.12)",
        background: active
          ? "rgba(147,180,240,0.18)"
          : subtle
            ? "rgba(255,255,255,0.05)"
            : "rgba(147,180,240,0.14)",
        color: "#f3efe8",
        borderRadius: 999,
        padding: "6px 11px",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        lineHeight: 1.1,
        letterSpacing: ".02em",
      }}
    >
      {children}
    </button>
  );
}

function EditableRegion({
  enabled = false,
  active = false,
  onEdit,
  children,
  hint = "Click to edit",
  dark = true,
  displayStyle = {},
}) {
  const [hovered, setHovered] = React.useState(false);

  if (!enabled) {
    return <div style={displayStyle}>{children}</div>;
  }

  const borderColor = dark
    ? active
      ? "rgba(147,180,240,0.55)"
      : hovered
        ? "rgba(255,255,255,0.22)"
        : "transparent"
    : active
      ? "rgba(56,80,50,0.45)"
      : hovered
        ? "rgba(0,0,0,0.14)"
        : "transparent";

  return (
    <div
      onClick={onEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        cursor: enabled ? "text" : "default",
        borderRadius: 12,
        outline: `1px dashed ${borderColor}`,
        outlineOffset: 4,
        transition: "outline-color 140ms ease",
        ...displayStyle,
      }}
    >
      {children}
      {(hovered || active) ? (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -2,
            pointerEvents: "none",
            padding: "3px 8px",
            borderRadius: 999,
            background: dark ? "rgba(7,10,9,0.82)" : "rgba(255,255,255,0.86)",
            color: dark ? "#d7ddd8" : "#1a1f1c",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            border: dark
              ? "1px solid rgba(255,255,255,0.10)"
              : "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
            whiteSpace: "nowrap",
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function InlineTextEditor({
  value,
  onChange,
  onBlur,
  onKeyDown,
  style = {},
  placeholder = "",
  multiline = false,
  dark = true,
}) {
  const baseStyle = {
    width: "100%",
    background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    color: dark ? "#f3efe8" : "#171717",
    border: dark ? "1px dashed rgba(255,255,255,0.28)" : "1px dashed rgba(0,0,0,0.18)",
    padding: 10,
    font: "inherit",
    borderRadius: 12,
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{ ...baseStyle, minHeight: 88, resize: "vertical" }}
      />
    );
  }

  return (
    <input
      autoFocus
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={baseStyle}
    />
  );
}

function InlineField({
  editorMode = false,
  editing = false,
  value = "",
  onChange,
  onStartEdit,
  onStopEdit,
  multiline = false,
  display,
  placeholder = "",
  dark = true,
  style = {},
  displayStyle = {},
  hint = "Click to edit",
}) {
  if (!editing) {
    return (
      <EditableRegion
        enabled={editorMode}
        active={false}
        onEdit={onStartEdit}
        dark={dark}
        hint={hint}
        displayStyle={displayStyle}
      >
        {display ?? value ?? ""}
      </EditableRegion>
    );
  }

  const handleKeyDown = (e) => {
    if (!multiline && e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") e.currentTarget.blur();
  };

  return (
    <EditableRegion
      enabled={editorMode}
      active={true}
      onEdit={onStartEdit}
      dark={dark}
      hint={hint}
      displayStyle={displayStyle}
    >
      <InlineTextEditor
        value={value}
        onChange={onChange}
        onBlur={onStopEdit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        multiline={multiline}
        dark={dark}
        style={style}
      />
    </EditableRegion>
  );
}

function normalizeAboutContent(src = {}) {
  return {
    eyebrow: String(src?.eyebrow || "Dual Power West"),
    title: String(src?.title || "About"),
    hero_summary: String(src?.hero_summary || "a gathering for learning, sharing, building, and reflection"),
    sections: Array.isArray(src?.sections) && src.sections.length
      ? src.sections.slice(0, 3).map((x, i) => ({
          kicker: String(x?.kicker || ["What this is", "What we value", "How it works"][i] || ""),
          heading: String(x?.heading || ""),
          body: String(x?.body || ""),
        }))
      : [
          {
            kicker: "What this is",
            heading: "a gathering, not a performance",
            body: "Dual Power West is a gathering for learning, sharing, building, and reflection across anti authoritarian and anti capitalist movements.",
          },
          {
            kicker: "What we value",
            heading: "trust, courage, and practical capacity",
            body: "We are building a space for trust, skill sharing, solidarity, and collective exploration. The point is not polished conference culture. The point is relationships, courage, and practical capacity.",
          },
          {
            kicker: "How it works",
            heading: "public front door, private organizer tools",
            body: "This public site is the front door. Organizer tools, internal logistics, and planning live behind sign in.",
          },
        ],
    quote_kicker: String(src?.quote_kicker || "Why this exists"),
    quote_text: String(src?.quote_text || "this is not a conference. it is a practice."),
    meta_rows: Array.isArray(src?.meta_rows) && src.meta_rows.length
      ? src.meta_rows.slice(0, 3).map((x, i) => ({
          label: String(x?.label || ["Structure", "Purpose", "Orientation"][i] || ""),
          value: String(x?.value || ""),
        }))
      : [
          {
            label: "Structure",
            value: "participant shaped, organizer supported, movement rooted",
          },
          {
            label: "Purpose",
            value: "build stronger relationships, sharper skills, and more durable forms of collective power",
          },
          {
            label: "Orientation",
            value: "anti authoritarian, anti capitalist, practical, collaborative",
          },
        ],
    sticky_title: String(src?.sticky_title || "come build something with us"),
    sticky_body: String(src?.sticky_body || "the goal is not polish. the goal is that people leave more connected, more capable, and more ready to act together."),
  };
}

function AboutPageLayout({
  page,
  accent,
  editorMode = false,
  activeField = "",
  setActiveField = () => {},
  content,
  setContent = () => {},
}) {
  const updateSection = (index, key, value) => {
    const next = [...content.sections];
    next[index] = { ...(next[index] || {}), [key]: value };
    setContent({ ...content, sections: next });
  };

  const updateMeta = (index, key, value) => {
    const next = [...content.meta_rows];
    next[index] = { ...(next[index] || {}), [key]: value };
    setContent({ ...content, meta_rows: next });
  };

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

        @media (max-width: 880px) {
          .dpg-about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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
          <InlineField
            editorMode={editorMode}
            editing={editorMode && activeField === "about_eyebrow"}
            value={content.eyebrow}
            onChange={(v) => setContent({ ...content, eyebrow: v })}
            onStartEdit={() => setActiveField("about_eyebrow")}
            onStopEdit={() => setActiveField("")}
            placeholder="Eyebrow"
            hint="Edit eyebrow"
            display={content.eyebrow}
            displayStyle={{
              color: "#d7ddd8",
              marginBottom: 10,
              fontSize: 15,
              borderRadius: 10,
            }}
          />
          <InlineField
            editorMode={editorMode}
            editing={editorMode && activeField === "about_title"}
            value={content.title}
            onChange={(v) => setContent({ ...content, title: v })}
            onStartEdit={() => setActiveField("about_title")}
            onStopEdit={() => setActiveField("")}
            placeholder="Title"
            hint="Edit title"
            display={content.title}
            displayStyle={{
              margin: 0,
              color: accent,
              fontSize: "clamp(2.6rem, 6vw, 5.4rem)",
              lineHeight: 0.95,
              fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              borderRadius: 14,
            }}
            style={{
              fontSize: "clamp(2.6rem, 6vw, 5.4rem)",
              lineHeight: 0.95,
              fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
            }}
          />
          <div style={{ marginTop: 14 }}>
            <InlineField
              editorMode={editorMode}
              editing={editorMode && activeField === "about_summary"}
              value={content.hero_summary}
              onChange={(v) => setContent({ ...content, hero_summary: v })}
              onStartEdit={() => setActiveField("about_summary")}
              onStopEdit={() => setActiveField("")}
              placeholder="Summary"
              hint="Edit summary"
              display={content.hero_summary}
              displayStyle={{
                color: "#f3efe8",
                fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
                lineHeight: 1.2,
                maxWidth: 840,
                fontFamily: "Inter, system-ui, Arial, sans-serif",
                fontWeight: 500,
                borderRadius: 12,
              }}
              style={{
                fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
                lineHeight: 1.2,
                maxWidth: 840,
                fontFamily: "Inter, system-ui, Arial, sans-serif",
                fontWeight: 500,
              }}
            />
          </div>
        </div>
      </header>

      <section className="dpg-about-grid">
        <div style={{ display: "grid", gap: 18 }}>
          {content.sections.map((section, idx) => (
            <article className="dpg-about-card" key={`section-${idx}`}>
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === `section_${idx}_kicker`}
                value={section.kicker}
                onChange={(v) => updateSection(idx, "kicker", v)}
                onStartEdit={() => setActiveField(`section_${idx}_kicker`)}
                onStopEdit={() => setActiveField("")}
                placeholder="Section kicker"
                hint="Edit kicker"
                display={section.kicker}
                displayStyle={{
                  marginBottom: 10,
                  color: accent,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderRadius: 10,
                }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === `section_${idx}_heading`}
                value={section.heading}
                onChange={(v) => updateSection(idx, "heading", v)}
                onStartEdit={() => setActiveField(`section_${idx}_heading`)}
                onStopEdit={() => setActiveField("")}
                placeholder="Section heading"
                hint="Edit heading"
                display={section.heading}
                displayStyle={{
                  margin: "0 0 12px",
                  color: "#f3efe8",
                  fontFamily: "Inter, system-ui, Arial, sans-serif",
                  fontSize: "1.05rem",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                  borderRadius: 10,
                }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === `section_${idx}_body`}
                value={section.body}
                onChange={(v) => updateSection(idx, "body", v)}
                onStartEdit={() => setActiveField(`section_${idx}_body`)}
                onStopEdit={() => setActiveField("")}
                placeholder="Section body"
                multiline
                hint="Edit body"
                display={section.body}
                displayStyle={{
                  color: "#f3efe8",
                  lineHeight: 1.72,
                  fontSize: "1.06rem",
                  borderRadius: 10,
                }}
              />
            </article>
          ))}
        </div>

        <aside className="dpg-about-side">
          <div className="dpg-about-card dpg-about-quote">
            <InlineField
              editorMode={editorMode}
              editing={editorMode && activeField === "quote_kicker"}
              value={content.quote_kicker}
              onChange={(v) => setContent({ ...content, quote_kicker: v })}
              onStartEdit={() => setActiveField("quote_kicker")}
              onStopEdit={() => setActiveField("")}
              placeholder="Quote kicker"
              hint="Edit kicker"
              display={content.quote_kicker}
              displayStyle={{
                marginBottom: 10,
                color: accent,
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderRadius: 10,
              }}
            />
            <InlineField
              editorMode={editorMode}
              editing={editorMode && activeField === "quote_text"}
              value={content.quote_text}
              onChange={(v) => setContent({ ...content, quote_text: v })}
              onStartEdit={() => setActiveField("quote_text")}
              onStopEdit={() => setActiveField("")}
              placeholder="Quote text"
              multiline
              hint="Edit quote"
              display={content.quote_text}
              displayStyle={{
                paddingLeft: 18,
                fontSize: "1.14rem",
                lineHeight: 1.58,
                borderRadius: 10,
              }}
            />
          </div>

          <div className="dpg-about-card dpg-about-meta">
            {content.meta_rows.map((row, idx) => (
              <div className="dpg-about-meta-row" key={`meta-${idx}`}>
                <InlineField
                  editorMode={editorMode}
                  editing={editorMode && activeField === `meta_${idx}_label`}
                  value={row.label}
                  onChange={(v) => updateMeta(idx, "label", v)}
                  onStartEdit={() => setActiveField(`meta_${idx}_label`)}
                  onStopEdit={() => setActiveField("")}
                  placeholder="Meta label"
                  hint="Edit label"
                  display={row.label}
                  displayStyle={{
                    color: accent,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderRadius: 10,
                  }}
                />
                <InlineField
                  editorMode={editorMode}
                  editing={editorMode && activeField === `meta_${idx}_value`}
                  value={row.value}
                  onChange={(v) => updateMeta(idx, "value", v)}
                  onStartEdit={() => setActiveField(`meta_${idx}_value`)}
                  onStopEdit={() => setActiveField("")}
                  placeholder="Meta value"
                  multiline
                  hint="Edit value"
                  display={row.value}
                  displayStyle={{
                    color: "#f3efe8",
                    lineHeight: 1.58,
                    borderRadius: 10,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="dpg-about-sticky">
            <InlineField
              editorMode={editorMode}
              editing={editorMode && activeField === "sticky_title"}
              value={content.sticky_title}
              onChange={(v) => setContent({ ...content, sticky_title: v })}
              onStartEdit={() => setActiveField("sticky_title")}
              onStopEdit={() => setActiveField("")}
              placeholder="Sticky title"
              hint="Edit title"
              dark={false}
              display={content.sticky_title}
              displayStyle={{
                margin: "0 0 8px",
                color: "#171717",
                fontFamily: "Inter, system-ui, Arial, sans-serif",
                fontSize: "1rem",
                lineHeight: 1.1,
                fontWeight: 800,
                borderRadius: 10,
              }}
            />
            <InlineField
              editorMode={editorMode}
              editing={editorMode && activeField === "sticky_body"}
              value={content.sticky_body}
              onChange={(v) => setContent({ ...content, sticky_body: v })}
              onStartEdit={() => setActiveField("sticky_body")}
              onStopEdit={() => setActiveField("")}
              placeholder="Sticky body"
              multiline
              hint="Edit note"
              dark={false}
              display={content.sticky_body}
              displayStyle={{
                color: "#171717",
                lineHeight: 1.56,
                fontSize: "0.98rem",
                borderRadius: 10,
              }}
            />
          </div>
        </aside>
      </section>
    </>
  );
}

function GenericPublicPage({ page, accent }) {
  return (
    <>
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
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: 22,
          background: "rgba(26,33,30,0.94)",
          color: "#f3efe8",
          lineHeight: 1.7,
        }}
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </>
  );
}

export default function PublicContentPage({ slug: slugProp = "" }) {
  const { config } = useDpgPublicSiteConfig();
  const [authState, setAuthState] = React.useState({ checked: false, authed: false });
  const [editorMode, setEditorMode] = React.useState(false);
  const [activeField, setActiveField] = React.useState("");
  const [draftPages, setDraftPages] = React.useState({});
  const [savedPagesOverride, setSavedPagesOverride] = React.useState(null);
  const [saveBusy, setSaveBusy] = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState("");
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

  const basePage = getDpgPublicPage(slug);

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
  const contentPages = savedPagesOverride || config?.content_pages || {};
  const currentPageOverride = contentPages?.[slug] || {};
  const page = basePage ? { ...basePage, ...currentPageOverride } : null;

  const aboutContent = normalizeAboutContent({
    ...(contentPages?.about || {}),
    ...(draftPages?.about || {}),
  });

  const beginEditing = () => {
    setDraftPages(contentPages || {});
    setEditorMode(true);
    setActiveField("");
    setSaveMsg("");
  };

  const cancelEditing = () => {
    setDraftPages(contentPages || {});
    setEditorMode(false);
    setActiveField("");
    setSaveMsg("");
  };

  const saveDraft = async () => {
    setSaveBusy(true);
    setSaveMsg("");
    try {
      const payload = {
        ...config,
        content_pages: draftPages,
      };
      const r = await authFetch("/api/orgs/dpg/public/save", {
        method: "POST",
        body: payload,
      });
      const nextPages = r?.public?.content_pages || draftPages;
      setSavedPagesOverride(nextPages);
      setDraftPages(nextPages);
      setSaveMsg("Saved.");
      setTimeout(() => setSaveMsg(""), 1200);
    } catch (e) {
      setSaveMsg(e.message || "Failed to save");
    } finally {
      setSaveBusy(false);
    }
  };

  const setAboutContent = (next) => {
    setDraftPages((prev) => ({
      ...(prev || {}),
      about: next,
    }));
  };

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

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      {authState.authed ? (
        <button
          type="button"
          onClick={() => (editorMode ? cancelEditing() : beginEditing())}
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 50,
            border: 0,
            borderRadius: 999,
            padding: "12px 18px",
            background: editorMode ? "#f4f2eb" : accent,
            color: editorMode ? "#121715" : "#f3efe8",
            cursor: "pointer",
            fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
            fontWeight: 800,
            boxShadow: "0 14px 32px rgba(0,0,0,0.28)",
          }}
        >
          {editorMode ? "Exit editor" : "Edit site"}
        </button>
      ) : null}

      {editorMode ? (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            padding: "10px 18px",
            background: "rgba(10,14,12,0.88)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "grid", gap: 2 }}>
            <strong style={{ color: "#f3efe8", fontSize: 14 }}>Live editor</strong>
            <span style={{ color: "#8fa1ab", fontSize: 12 }}>
              Click the actual content to edit. Save only when you want to publish.
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {saveMsg ? (
              <span style={{ color: saveMsg.includes("Saved") ? "#9fd3ab" : "#ffb8b8", fontSize: 13 }}>
                {saveMsg}
              </span>
            ) : null}
            <button type="button" className="btn" onClick={cancelEditing} disabled={saveBusy}>
              Cancel
            </button>
            <button type="button" className="btn-red" onClick={saveDraft} disabled={saveBusy}>
              {saveBusy ? "Saving…" : "Save and publish"}
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ maxWidth: slug === "about" ? 1240 : 1040, margin: "0 auto", padding: "32px 20px 80px" }}>
        <PublicNav links={navLinks} authed={authState.authed} accent={accent} />

        {slug === "about" ? (
          <AboutPageLayout
            page={page}
            accent={accent}
            editorMode={editorMode}
            activeField={activeField}
            setActiveField={setActiveField}
            content={aboutContent}
            setContent={setAboutContent}
          />
        ) : (
          <GenericPublicPage page={page} accent={accent} />
        )}
      </div>
    </div>
  );
}
