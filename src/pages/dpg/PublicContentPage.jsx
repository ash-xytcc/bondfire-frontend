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

  if (!enabled) return <div style={displayStyle}>{children}</div>;

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

function PageHero({
  accent,
  editorMode,
  activeField,
  setActiveField,
  prefix,
  content,
  setContent,
}) {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 22,
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
          editing={editorMode && activeField === `${prefix}_eyebrow`}
          value={content.eyebrow}
          onChange={(v) => setContent({ ...content, eyebrow: v })}
          onStartEdit={() => setActiveField(`${prefix}_eyebrow`)}
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
          editing={editorMode && activeField === `${prefix}_title`}
          value={content.title}
          onChange={(v) => setContent({ ...content, title: v })}
          onStartEdit={() => setActiveField(`${prefix}_title`)}
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
            editing={editorMode && activeField === `${prefix}_intro`}
            value={content.intro}
            onChange={(v) => setContent({ ...content, intro: v })}
            onStartEdit={() => setActiveField(`${prefix}_intro`)}
            onStopEdit={() => setActiveField("")}
            placeholder="Intro"
            hint="Edit intro"
            display={content.intro}
            displayStyle={{
              color: "#f3efe8",
              fontSize: "1.12rem",
              lineHeight: 1.55,
              maxWidth: 860,
              borderRadius: 12,
            }}
          />
        </div>
      </div>
    </header>
  );
}

function normalizePressContent(src = {}, page = {}) {
  return {
    eyebrow: String(src?.eyebrow || page?.eyebrow || "Media, roundtables, and traces left behind."),
    title: String(src?.title || page?.title || "Press"),
    intro: String(src?.intro || "Listen, watch, and read coverage connected to Dual Power West without dumping people into a sad link graveyard."),
    featured_title: String(src?.featured_title || "Featured media"),
    side_title: String(src?.side_title || "What this section is for"),
    side_body: String(src?.side_body || "A place to collect audio, video, interviews, and writeups that help people understand the gathering and what it produced."),
    sticky_title: String(src?.sticky_title || "archive the signal"),
    sticky_body: String(src?.sticky_body || "media matters most when people can actually find it again later."),
    items: Array.isArray(src?.items) && src.items.length
      ? src.items.slice(0, 6).map((x, i) => ({
          type: String(x?.type || (i < 2 ? "embed" : "link")).trim() || "link",
          title: String(x?.title || "").trim(),
          url: String(x?.url || "").trim(),
          embedUrl: String(x?.embedUrl || x?.embed_url || x?.url || "").trim(),
          description: String(x?.description || "").trim(),
        })).filter((x) => x.title || x.url || x.embedUrl)
      : [
          {
            type: "embed",
            title: "Episode 8: Dual Power Gathering West Roundtable",
            url: "https://kolektiva.media/w/2im6KJj8NRBPbZwTxxAuwr",
            embedUrl: "https://kolektiva.media/videos/embed/2im6KJj8NRBPbZwTxxAuwr",
            description: "Round table discussion with participants and organizers reflecting on the gathering, what worked, what changed, and what should grow next.",
          },
          {
            type: "embed",
            title: "Molotov Now! interview",
            url: "https://kolektiva.media/w/bfGVFNr6yViDQD2nN8eHez",
            embedUrl: "https://kolektiva.media/videos/embed/bfGVFNr6yViDQD2nN8eHez",
            description: "Interview coverage connected to DPG West.",
          },
          {
            type: "link",
            title: "This Is America #189",
            url: "https://itsgoingdown.org/this-is-america-189/",
            embedUrl: "",
            description: "Article and broader movement coverage tied into the event and its context.",
          },
        ],
  };
}

function PressPageLayout({ accent, editorMode = false, activeField = "", setActiveField = () => {}, content, setContent = () => {} }) {
  const updateItem = (index, key, value) => {
    const next = [...content.items];
    next[index] = { ...(next[index] || {}), [key]: value };
    setContent({
      ...content,
      items: next.filter((x) => String(x?.title || "").trim() || String(x?.url || "").trim() || String(x?.embedUrl || "").trim()),
    });
  };

  return (
    <>
      <style>{`
        .dpg-press-shell { display: grid; gap: 24px; }
        .dpg-press-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
          gap: 22px;
          align-items: start;
        }
        .dpg-press-main {
          display: grid;
          gap: 18px;
        }
        .dpg-press-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 18px 42px rgba(0,0,0,0.16);
        }
        .dpg-press-embed {
          width: 100%;
          aspect-ratio: 16 / 9;
          border: 0;
          border-radius: 18px;
          background: rgba(0,0,0,0.22);
          margin-top: 14px;
        }
        .dpg-press-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }
        .dpg-press-linkbtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 999px;
          text-decoration: none;
          background: ${accent};
          color: #121715;
          font-weight: 800;
        }
        .dpg-press-ghostbtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 999px;
          text-decoration: none;
          background: rgba(255,255,255,0.06);
          color: #f3efe8;
          border: 1px solid rgba(255,255,255,0.10);
          font-weight: 800;
        }
        .dpg-press-side {
          display: grid;
          gap: 18px;
        }
        .dpg-press-sticky {
          background: #f3e28b;
          color: #171717;
          border-radius: 16px;
          padding: 18px;
          transform: rotate(1deg);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 18px 36px rgba(0,0,0,0.16);
        }
        @media (max-width: 920px) {
          .dpg-press-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dpg-press-shell">
        <PageHero
          accent={accent}
          editorMode={editorMode}
          activeField={activeField}
          setActiveField={setActiveField}
          prefix="press"
          content={content}
          setContent={setContent}
        />

        <section className="dpg-press-grid">
          <div className="dpg-press-main">
            <div className="dpg-press-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "press_featured_title"}
                value={content.featured_title}
                onChange={(v) => setContent({ ...content, featured_title: v })}
                onStartEdit={() => setActiveField("press_featured_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Featured title"
                hint="Edit section label"
                display={content.featured_title}
                displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8, borderRadius: 10 }}
              />

              <div style={{ display: "grid", gap: 18 }}>
                {content.items.map((item, idx) => (
                  <article
                    key={`press-${idx}`}
                    style={{
                      display: "grid",
                      gap: 10,
                      paddingBottom: idx < content.items.length - 1 ? 18 : 0,
                      borderBottom: idx < content.items.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {editorMode ? (
                        <EditChip
                          onClick={() => updateItem(idx, "type", item.type === "embed" ? "link" : "embed")}
                          subtle
                          active={item.type === "embed"}
                        >
                          {item.type === "embed" ? "Embedded" : "Link only"}
                        </EditChip>
                      ) : null}
                    </div>

                    <InlineField
                      editorMode={editorMode}
                      editing={editorMode && activeField === `press_title_${idx}`}
                      value={item.title}
                      onChange={(v) => updateItem(idx, "title", v)}
                      onStartEdit={() => setActiveField(`press_title_${idx}`)}
                      onStopEdit={() => setActiveField("")}
                      placeholder={`Media title ${idx + 1}`}
                      hint="Edit title"
                      display={item.title}
                      displayStyle={{ color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.15, borderRadius: 10 }}
                    />

                    <InlineField
                      editorMode={editorMode}
                      editing={editorMode && activeField === `press_desc_${idx}`}
                      value={item.description}
                      onChange={(v) => updateItem(idx, "description", v)}
                      onStartEdit={() => setActiveField(`press_desc_${idx}`)}
                      onStopEdit={() => setActiveField("")}
                      placeholder={`Description ${idx + 1}`}
                      multiline
                      hint="Edit description"
                      display={item.description}
                      displayStyle={{ color: "#f3efe8", lineHeight: 1.68, borderRadius: 10 }}
                    />

                    {editorMode ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <InlineField
                          editorMode={editorMode}
                          editing={editorMode && activeField === `press_url_${idx}`}
                          value={item.url}
                          onChange={(v) => updateItem(idx, "url", v)}
                          onStartEdit={() => setActiveField(`press_url_${idx}`)}
                          onStopEdit={() => setActiveField("")}
                          placeholder="Public URL"
                          hint="Edit URL"
                          display={item.url || "Set public URL"}
                          displayStyle={{ color: "#8fa1ab", fontSize: 13, lineHeight: 1.4, borderRadius: 10 }}
                        />
                        <InlineField
                          editorMode={editorMode}
                          editing={editorMode && activeField === `press_embed_${idx}`}
                          value={item.embedUrl}
                          onChange={(v) => updateItem(idx, "embedUrl", v)}
                          onStartEdit={() => setActiveField(`press_embed_${idx}`)}
                          onStopEdit={() => setActiveField("")}
                          placeholder="Embed URL"
                          hint="Edit embed"
                          display={item.embedUrl || "Set embed URL"}
                          displayStyle={{ color: "#8fa1ab", fontSize: 13, lineHeight: 1.4, borderRadius: 10 }}
                        />
                      </div>
                    ) : null}

                    {item.type === "embed" && item.embedUrl ? (
                      <iframe
                        className="dpg-press-embed"
                        src={item.embedUrl}
                        title={item.title || `Embedded media ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : null}

                    <div className="dpg-press-actions">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="dpg-press-linkbtn">
                          Open source
                        </a>
                      ) : null}
                      {item.embedUrl && item.type !== "embed" ? (
                        <a href={item.embedUrl} target="_blank" rel="noreferrer" className="dpg-press-ghostbtn">
                          Open embed
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>

              {editorMode && content.items.length < 6 ? (
                <div style={{ marginTop: 18 }}>
                  <EditChip
                    onClick={() =>
                      setContent({
                        ...content,
                        items: [
                          ...content.items,
                          { type: "link", title: "New media item", url: "", embedUrl: "", description: "" },
                        ],
                      })
                    }
                    subtle
                  >
                    Add media item
                  </EditChip>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="dpg-press-side">
            <div className="dpg-press-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "press_side_title"}
                value={content.side_title}
                onChange={(v) => setContent({ ...content, side_title: v })}
                onStartEdit={() => setActiveField("press_side_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Side title"
                hint="Edit label"
                display={content.side_title}
                displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "press_side_body"}
                value={content.side_body}
                onChange={(v) => setContent({ ...content, side_body: v })}
                onStartEdit={() => setActiveField("press_side_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Side body"
                multiline
                hint="Edit note"
                display={content.side_body}
                displayStyle={{ color: "#f3efe8", lineHeight: 1.68, borderRadius: 10 }}
              />
            </div>

            <div className="dpg-press-sticky">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "press_sticky_title"}
                value={content.sticky_title}
                onChange={(v) => setContent({ ...content, sticky_title: v })}
                onStartEdit={() => setActiveField("press_sticky_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Sticky title"
                hint="Edit title"
                dark={false}
                display={content.sticky_title}
                displayStyle={{ color: "#171717", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 800, fontSize: "1rem", lineHeight: 1.1, marginBottom: 8, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "press_sticky_body"}
                value={content.sticky_body}
                onChange={(v) => setContent({ ...content, sticky_body: v })}
                onStartEdit={() => setActiveField("press_sticky_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Sticky body"
                multiline
                hint="Edit note"
                dark={false}
                display={content.sticky_body}
                displayStyle={{ color: "#171717", lineHeight: 1.56, fontSize: "0.98rem", borderRadius: 10 }}
              />
            </div>
          </aside>
        </section>
      </div>
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

  const pressContent = normalizePressContent({
    ...(contentPages?.press || {}),
    ...(draftPages?.press || {}),
  }, page);

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

  const setPressContent = (next) => {
    setDraftPages((prev) => ({ ...(prev || {}), press: next }));
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

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 20px 80px" }}>
        <PublicNav links={navLinks} authed={authState.authed} accent={accent} />

        {slug === "press" ? (
          <PressPageLayout
            accent={accent}
            editorMode={editorMode}
            activeField={activeField}
            setActiveField={setActiveField}
            content={pressContent}
            setContent={setPressContent}
          />
        ) : (
          <GenericPublicPage page={page} accent={accent} />
        )}
      </div>
    </div>
  );
}
