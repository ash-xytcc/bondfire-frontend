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

function PageHero({
  logo = true,
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
        gridTemplateColumns: logo ? "auto 1fr" : "1fr",
        gap: 22,
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      {logo ? (
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
      ) : null}
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
        {"intro" in content ? (
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
        ) : null}
        {"hero_summary" in content ? (
          <div style={{ marginTop: 14 }}>
            <InlineField
              editorMode={editorMode}
              editing={editorMode && activeField === `${prefix}_summary`}
              value={content.hero_summary}
              onChange={(v) => setContent({ ...content, hero_summary: v })}
              onStartEdit={() => setActiveField(`${prefix}_summary`)}
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
            />
          </div>
        ) : null}
      </div>
    </header>
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

function normalizeFaqContent(src = {}, page = {}) {
  const defaults = [
    {
      q: "What is Dual Power?",
      a: "Dual power is the project of building self determination, mutual aid, solidarity, and direct democracy in our communities by creating spaces that empower us all and from which new emancipatory institutions can emerge.",
    },
    {
      q: "Who is organizing Dual Power West?",
      a: "Dual Power West is an autonomous event being organized by a developing network of tenants, workers, and activists participating in Symbiosis Federation, Autonomous Tenants Union Network, the Industrial Workers of the World, and independent dual power projects across the country. We are not affiliated with any political party.",
    },
    {
      q: "Why do we think this is important?",
      a: "We come together from across the spectrum of anti authoritarian and anti capitalist tendencies, traditions, and organizations. We want a space where people can build trusting relationships, construct bridges, share ideas, and strengthen each other.",
    },
    {
      q: "What kind of event is this?",
      a: "The gathering uses an unconference structure. That means participants help create the agenda, shape sessions, and bring their own ideas, skills, and questions into the space.",
    },
    {
      q: "Will it be child friendly?",
      a: "Several core organizers have children and they will be part of the event. Child friendly planning is part of the event culture, not an afterthought.",
    },
    {
      q: "What happens after the gathering?",
      a: "We are not imposing a predetermined outcome. What comes next will be defined locally, and the networks built through the gathering will help inform, grow, and articulate the movements that emerge from it.",
    },
  ];

  return {
    eyebrow: String(src?.eyebrow || page?.eyebrow || "Questions people keep asking because apparently reading minds is still not a feature."),
    title: String(src?.title || page?.title || "FAQ"),
    intro: String(src?.intro || "Answers, context, and basic orientation without making people dig through a wall of text."),
    side_title: String(src?.side_title || "Quick read"),
    side_body: String(src?.side_body || "Start here if you want the shape of the thing before you decide whether to show up, volunteer, or send this to somebody else."),
    items: Array.isArray(src?.items) && src.items.length
      ? src.items.slice(0, 10).map((x) => ({
          q: String(x?.q || "").trim(),
          a: String(x?.a || "").trim(),
        })).filter((x) => x.q || x.a)
      : defaults,
  };
}

function normalizeVolunteerContent(src = {}, page = {}) {
  return {
    eyebrow: String(src?.eyebrow || page?.eyebrow || "This only works if people actually help, tragic but true."),
    title: String(src?.title || page?.title || "Volunteer"),
    intro: String(src?.intro || "We need help before, during, and around the gathering. Not in the abstract. In the real world where someone has to actually do things."),
    lead_title: String(src?.lead_title || "We need your help"),
    lead_body: String(src?.lead_body || "We need all kinds of help in advance of and during the Western Dual Power Gathering to pull these events off."),
    list_title: String(src?.list_title || "Current areas of need"),
    needs: Array.isArray(src?.needs) && src.needs.length
      ? src.needs.slice(0, 12).map((x) => String(x || "").trim()).filter(Boolean)
      : [
          "Food and kitchen support",
          "Transportation",
          "Childcare",
          "Outreach and getting the word out",
          "Camping gear sharing and sourcing",
          "Fundraising",
          "Facilitation",
          "Organizing and logistics",
          "Communications",
          "Training, workshops, and session support",
        ],
    support_title: String(src?.support_title || "When help is needed"),
    support_body: String(src?.support_body || "We are looking for people who want to help during the event as well as people who want to help plan and organize beforehand."),
    contact_title: String(src?.contact_title || "Get involved"),
    contact_body: String(src?.contact_body || "If you want to get involved, email dualpowergathering@proton.me."),
    side_title: String(src?.side_title || "Good volunteer energy"),
    side_body: String(src?.side_body || "People who can follow through, coordinate with others, notice what is missing, and help without turning every practical task into a personal manifesto."),
    sticky_title: String(src?.sticky_title || "show up ready"),
    sticky_body: String(src?.sticky_body || "clarity, communication, and follow through are more useful than hype."),
  };
}

function AboutPageLayout({ accent, editorMode = false, activeField = "", setActiveField = () => {}, content, setContent = () => {} }) {
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
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 24px 24px 22px;
          box-shadow: 0 18px 42px rgba(0,0,0,0.16);
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
          top: 22px;
          bottom: 22px;
          width: 3px;
          border-radius: 999px;
          background: ${accent};
          opacity: 0.9;
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
        @media (max-width: 880px) {
          .dpg-about-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <PageHero
        accent={accent}
        editorMode={editorMode}
        activeField={activeField}
        setActiveField={setActiveField}
        prefix="about"
        content={content}
        setContent={setContent}
      />

      <section className="dpg-about-grid">
        <div style={{ display: "grid", gap: 18 }}>
          {content.sections.map((section, idx) => (
            <article key={`section-${idx}`} className="dpg-about-card">
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
                displayStyle={{ marginBottom: 10, color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", borderRadius: 10 }}
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
                displayStyle={{ margin: "0 0 12px", color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontSize: "1.05rem", lineHeight: 1.1, fontWeight: 800, letterSpacing: "0.02em", borderRadius: 10 }}
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
                displayStyle={{ color: "#f3efe8", lineHeight: 1.72, fontSize: "1.06rem", borderRadius: 10 }}
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
              displayStyle={{ marginBottom: 10, color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", borderRadius: 10 }}
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
              displayStyle={{ paddingLeft: 28, color: "#f3efe8", fontSize: "1.14rem", lineHeight: 1.58, borderRadius: 10 }}
            />
          </div>

          <div className="dpg-about-card" style={{ display: "grid", gap: 14 }}>
            {content.meta_rows.map((row, idx) => (
              <div key={`meta-${idx}`} style={{ display: "grid", gap: 4 }}>
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
                  displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", borderRadius: 10 }}
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
                  displayStyle={{ color: "#f3efe8", lineHeight: 1.58, borderRadius: 10 }}
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
              displayStyle={{ margin: "0 0 8px", color: "#171717", fontFamily: "Inter, system-ui, Arial, sans-serif", fontSize: "1rem", lineHeight: 1.1, fontWeight: 800, borderRadius: 10 }}
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
              displayStyle={{ color: "#171717", lineHeight: 1.56, fontSize: "0.98rem", borderRadius: 10 }}
            />
          </div>
        </aside>
      </section>
    </>
  );
}

function FaqPageLayout({ accent, editorMode = false, activeField = "", setActiveField = () => {}, content, setContent = () => {} }) {
  const [openIdx, setOpenIdx] = React.useState(0);

  const updateItem = (index, key, value) => {
    const next = [...content.items];
    next[index] = { ...(next[index] || {}), [key]: value };
    setContent({
      ...content,
      items: next.filter((x) => String(x?.q || "").trim() || String(x?.a || "").trim()),
    });
  };

  return (
    <>
      <style>{`
        .dpg-faq-shell { display: grid; gap: 24px; }
        .dpg-faq-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
          gap: 22px;
          align-items: start;
        }
        .dpg-faq-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 18px 42px rgba(0,0,0,0.16);
        }
        .dpg-faq-item {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
        }
        .dpg-faq-item + .dpg-faq-item { margin-top: 12px; }
        .dpg-faq-trigger {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 18px 18px 16px;
          background: transparent;
          border: 0;
          color: #f3efe8;
          text-align: left;
          cursor: pointer;
        }
        .dpg-faq-answer {
          padding: 0 18px 18px;
          color: #f3efe8;
          line-height: 1.72;
          font-size: 1.02rem;
        }
        .dpg-faq-side-note {
          background: #dce8d6;
          color: #171717;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 18px 36px rgba(0,0,0,0.16);
          border: 1px solid rgba(0,0,0,0.08);
        }
        @media (max-width: 920px) {
          .dpg-faq-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dpg-faq-shell">
        <PageHero
          accent={accent}
          editorMode={editorMode}
          activeField={activeField}
          setActiveField={setActiveField}
          prefix="faq"
          content={content}
          setContent={setContent}
        />

        <section className="dpg-faq-grid">
          <div className="dpg-faq-card">
            <div style={{ marginBottom: 16, color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Common questions
            </div>

            {content.items.map((item, idx) => {
              const open = openIdx === idx;
              return (
                <div className="dpg-faq-item" key={`faq-item-${idx}`}>
                  <button
                    type="button"
                    className="dpg-faq-trigger"
                    onClick={() => setOpenIdx(open ? -1 : idx)}
                  >
                    <InlineField
                      editorMode={editorMode}
                      editing={editorMode && activeField === `faq_q_${idx}`}
                      value={item.q}
                      onChange={(v) => updateItem(idx, "q", v)}
                      onStartEdit={() => setActiveField(`faq_q_${idx}`)}
                      onStopEdit={() => setActiveField("")}
                      placeholder={`Question ${idx + 1}`}
                      hint="Edit question"
                      display={item.q}
                      displayStyle={{ color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 800, fontSize: "1.08rem", lineHeight: 1.25, borderRadius: 10 }}
                    />
                    <div style={{ color: accent, fontSize: 22, lineHeight: 1, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 140ms ease" }}>
                      +
                    </div>
                  </button>

                  {open ? (
                    <div className="dpg-faq-answer">
                      <InlineField
                        editorMode={editorMode}
                        editing={editorMode && activeField === `faq_a_${idx}`}
                        value={item.a}
                        onChange={(v) => updateItem(idx, "a", v)}
                        onStartEdit={() => setActiveField(`faq_a_${idx}`)}
                        onStopEdit={() => setActiveField("")}
                        placeholder={`Answer ${idx + 1}`}
                        multiline
                        hint="Edit answer"
                        display={item.a}
                        displayStyle={{ color: "#f3efe8", lineHeight: 1.72, fontSize: "1.02rem", borderRadius: 10 }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}

            {editorMode && content.items.length < 10 ? (
              <div style={{ marginTop: 14 }}>
                <EditChip
                  onClick={() => setContent({ ...content, items: [...content.items, { q: "New question", a: "New answer" }] })}
                  subtle
                >
                  Add question
                </EditChip>
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div className="dpg-faq-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "faq_side_title"}
                value={content.side_title}
                onChange={(v) => setContent({ ...content, side_title: v })}
                onStartEdit={() => setActiveField("faq_side_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Side title"
                hint="Edit label"
                display={content.side_title}
                displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "faq_side_body"}
                value={content.side_body}
                onChange={(v) => setContent({ ...content, side_body: v })}
                onStartEdit={() => setActiveField("faq_side_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Side body"
                multiline
                hint="Edit note"
                display={content.side_body}
                displayStyle={{ color: "#f3efe8", lineHeight: 1.68, borderRadius: 10 }}
              />
            </div>

            <div className="dpg-faq-side-note">
              <div style={{ color: "#171717", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                Shortcut
              </div>
              <div style={{ color: "#171717", lineHeight: 1.58 }}>
                RSVP if you know you are coming. Volunteer if you want to help shape the thing. Send the FAQ to the person who is asking you six separate questions in a row.
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function VolunteerPageLayout({ accent, editorMode = false, activeField = "", setActiveField = () => {}, content, setContent = () => {} }) {
  const updateNeed = (index, value) => {
    const next = [...content.needs];
    while (next.length < 12) next.push("");
    next[index] = value;
    setContent({ ...content, needs: next.filter((x) => String(x || "").trim()) });
  };

  return (
    <>
      <style>{`
        .dpg-vol-shell { display: grid; gap: 24px; }
        .dpg-vol-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
          gap: 22px;
          align-items: start;
        }
        .dpg-vol-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 18px 42px rgba(0,0,0,0.16);
        }
        .dpg-vol-needs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .dpg-vol-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 14px 14px;
          color: #f3efe8;
          min-height: 62px;
          display: flex;
          align-items: center;
        }
        .dpg-vol-side {
          display: grid;
          gap: 18px;
        }
        .dpg-vol-sticky {
          background: #f3e28b;
          color: #171717;
          border-radius: 16px;
          padding: 18px;
          transform: rotate(1deg);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 18px 36px rgba(0,0,0,0.16);
        }
        .dpg-vol-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 999px;
          background: ${accent};
          color: #121715;
          text-decoration: none;
          font-weight: 800;
        }
        @media (max-width: 920px) {
          .dpg-vol-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dpg-vol-shell">
        <PageHero
          accent={accent}
          editorMode={editorMode}
          activeField={activeField}
          setActiveField={setActiveField}
          prefix="vol"
          content={content}
          setContent={setContent}
        />

        <section className="dpg-vol-grid">
          <div style={{ display: "grid", gap: 18 }}>
            <article className="dpg-vol-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_lead_title"}
                value={content.lead_title}
                onChange={(v) => setContent({ ...content, lead_title: v })}
                onStartEdit={() => setActiveField("vol_lead_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Lead title"
                hint="Edit title"
                display={content.lead_title}
                displayStyle={{ color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 800, fontSize: "2rem", lineHeight: 1.05, marginBottom: 14, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_lead_body"}
                value={content.lead_body}
                onChange={(v) => setContent({ ...content, lead_body: v })}
                onStartEdit={() => setActiveField("vol_lead_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Lead body"
                multiline
                hint="Edit intro block"
                display={content.lead_body}
                displayStyle={{ color: "#f3efe8", lineHeight: 1.68, fontSize: "1.06rem", borderRadius: 10 }}
              />
            </article>

            <article className="dpg-vol-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_list_title"}
                value={content.list_title}
                onChange={(v) => setContent({ ...content, list_title: v })}
                onStartEdit={() => setActiveField("vol_list_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="List title"
                hint="Edit section label"
                display={content.list_title}
                displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, borderRadius: 10 }}
              />

              <div className="dpg-vol-needs">
                {Array.from({ length: Math.max(content.needs.length, editorMode ? 10 : content.needs.length) }).map((_, idx) => {
                  const value = content.needs[idx] || "";
                  return (
                    <div className="dpg-vol-pill" key={`need-${idx}`}>
                      <InlineField
                        editorMode={editorMode}
                        editing={editorMode && activeField === `vol_need_${idx}`}
                        value={value}
                        onChange={(v) => updateNeed(idx, v)}
                        onStartEdit={() => setActiveField(`vol_need_${idx}`)}
                        onStopEdit={() => setActiveField("")}
                        placeholder={`Need ${idx + 1}`}
                        hint="Edit need"
                        display={value || (editorMode ? "Empty need slot" : "")}
                        displayStyle={{ color: "#f3efe8", lineHeight: 1.45, width: "100%", borderRadius: 10 }}
                      />
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="dpg-vol-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_support_title"}
                value={content.support_title}
                onChange={(v) => setContent({ ...content, support_title: v })}
                onStartEdit={() => setActiveField("vol_support_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Support title"
                hint="Edit title"
                display={content.support_title}
                displayStyle={{ color: "#f3efe8", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.1, marginBottom: 10, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_support_body"}
                value={content.support_body}
                onChange={(v) => setContent({ ...content, support_body: v })}
                onStartEdit={() => setActiveField("vol_support_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Support body"
                multiline
                hint="Edit body"
                display={content.support_body}
                displayStyle={{ color: "#f3efe8", lineHeight: 1.68, borderRadius: 10 }}
              />
            </article>
          </div>

          <aside className="dpg-vol-side">
            <div className="dpg-vol-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_contact_title"}
                value={content.contact_title}
                onChange={(v) => setContent({ ...content, contact_title: v })}
                onStartEdit={() => setActiveField("vol_contact_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Contact title"
                hint="Edit title"
                display={content.contact_title}
                displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_contact_body"}
                value={content.contact_body}
                onChange={(v) => setContent({ ...content, contact_body: v })}
                onStartEdit={() => setActiveField("vol_contact_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Contact body"
                multiline
                hint="Edit contact"
                display={content.contact_body}
                displayStyle={{ color: "#f3efe8", lineHeight: 1.68, marginBottom: 16, borderRadius: 10 }}
              />
              <a
                href="mailto:dualpowergathering@proton.me"
                className="dpg-vol-cta"
              >
                Email organizers
              </a>
            </div>

            <div className="dpg-vol-card">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_side_title"}
                value={content.side_title}
                onChange={(v) => setContent({ ...content, side_title: v })}
                onStartEdit={() => setActiveField("vol_side_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Side title"
                hint="Edit label"
                display={content.side_title}
                displayStyle={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_side_body"}
                value={content.side_body}
                onChange={(v) => setContent({ ...content, side_body: v })}
                onStartEdit={() => setActiveField("vol_side_body")}
                onStopEdit={() => setActiveField("")}
                placeholder="Side body"
                multiline
                hint="Edit note"
                display={content.side_body}
                displayStyle={{ color: "#f3efe8", lineHeight: 1.68, borderRadius: 10 }}
              />
            </div>

            <div className="dpg-vol-sticky">
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_sticky_title"}
                value={content.sticky_title}
                onChange={(v) => setContent({ ...content, sticky_title: v })}
                onStartEdit={() => setActiveField("vol_sticky_title")}
                onStopEdit={() => setActiveField("")}
                placeholder="Sticky title"
                hint="Edit title"
                dark={false}
                display={content.sticky_title}
                displayStyle={{ color: "#171717", fontFamily: "Inter, system-ui, Arial, sans-serif", fontWeight: 800, fontSize: "1rem", lineHeight: 1.1, marginBottom: 8, borderRadius: 10 }}
              />
              <InlineField
                editorMode={editorMode}
                editing={editorMode && activeField === "vol_sticky_body"}
                value={content.sticky_body}
                onChange={(v) => setContent({ ...content, sticky_body: v })}
                onStartEdit={() => setActiveField("vol_sticky_body")}
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

  const aboutContent = normalizeAboutContent({
    ...(contentPages?.about || {}),
    ...(draftPages?.about || {}),
  });

  const faqContent = normalizeFaqContent({
    ...(contentPages?.faq || {}),
    ...(draftPages?.faq || {}),
  }, page);

  const volunteerContent = normalizeVolunteerContent({
    ...(contentPages?.volunteer || {}),
    ...(draftPages?.volunteer || {}),
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

  const setAboutContent = (next) => {
    setDraftPages((prev) => ({ ...(prev || {}), about: next }));
  };

  const setFaqContent = (next) => {
    setDraftPages((prev) => ({ ...(prev || {}), faq: next }));
  };

  const setVolunteerContent = (next) => {
    setDraftPages((prev) => ({ ...(prev || {}), volunteer: next }));
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

      <div style={{ maxWidth: slug === "about" ? 1240 : 1160, margin: "0 auto", padding: "32px 20px 80px" }}>
        <PublicNav links={navLinks} authed={authState.authed} accent={accent} />

        {slug === "about" ? (
          <AboutPageLayout
            accent={accent}
            editorMode={editorMode}
            activeField={activeField}
            setActiveField={setActiveField}
            content={aboutContent}
            setContent={setAboutContent}
          />
        ) : slug === "faq" ? (
          <FaqPageLayout
            accent={accent}
            editorMode={editorMode}
            activeField={activeField}
            setActiveField={setActiveField}
            content={faqContent}
            setContent={setFaqContent}
          />
        ) : slug === "volunteer" ? (
          <VolunteerPageLayout
            accent={accent}
            editorMode={editorMode}
            activeField={activeField}
            setActiveField={setActiveField}
            content={volunteerContent}
            setContent={setVolunteerContent}
          />
        ) : (
          <GenericPublicPage page={page} accent={accent} />
        )}
      </div>
    </div>
  );
}
