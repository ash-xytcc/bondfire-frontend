import React from "react"
import { Link } from "react-router-dom"
import "../styles/redharbor-public-pass1.css"

const ORG_ID = "red-harbor"
const ORG_SLUG = "red-harbor"

const defaultHome = {
  branch_label: "Red Harbor Branch",
  hero_headline: "Building worker power on the harbor and beyond.",
  hero_text:
    "Red Harbor is a branch of the Industrial Workers of the World. We organize across workplaces, support workers in struggle, publish branch updates, and build solidarity rooted in direct action and rank and file power.",
  about_intro:
    "Red Harbor is the local IWW branch building organization, education, and solidarity among workers in Aberdeen, Hoquiam, Grays Harbor, and the surrounding region.",
  purpose_title: "What this site is for",
  about_title: "About Red Harbor",
  join_title: "Organize with us",
  bulletin_title: "Publications and updates",
  events_title: "Meetings and public activity",
  contact_title: "Get in touch",
  about_card_title: "Branch overview",
  about_card_body:
    "Red Harbor is the local IWW branch building organization, education, and solidarity among workers in Aberdeen, Hoquiam, Grays Harbor, and the surrounding region.",
  location_card_title: "Location",
  location_card_body: "Red Harbor Branch",
  join_intro:
    "Organize with the branch, connect with others, and build power through workplace struggle, direct action, and collective effort.",
  contact_intro:
    "Reach out for branch contact, organizing support, membership questions, or public inquiries.",
  events_intro:
    "Meetings, branch activity, and public events will appear here as the public side develops.",
  font_family: "system",
  accent_color: "#a11f1f",
  show_action_strip: true,
  show_what_we_do: true,
  show_get_involved: true,
  show_meetings: true,
  show_newsletter_card: false,
  show_website_button: false,
  website_link: null,
  what_we_do: [
    "Workplace organizing support",
    "Branch meetings and political education",
    "Public bulletins and branch updates",
    "Solidarity rooted in direct action",
  ],
  site_purpose_items: [
    "Learn what the branch is and what it does",
    "Find organizing and membership information",
    "Read public updates and branch publications",
    "Access the private branch board through sign in",
  ],
  join_cards: [
    {
      title: "Join the branch",
      body: "Become part of the Red Harbor branch and plug into meetings, campaigns, education, and organizing support.",
    },
    {
      title: "Organize your workplace",
      body: "If you want help organizing on the job, reach out. We can help you start carefully, map relationships, and build toward collective action.",
    },
    {
      title: "Support broader struggle",
      body: "Workers, tenants, precarious workers, and unemployed workers all deserve organization, dignity, and solidarity. There is room to build.",
    },
  ],
  events_items: [
    "Branch meetings and public events will be posted here.",
    "Workplace organizing support and one to one follow up available.",
    "Bulletin updates and announcements published on a regular basis.",
  ],
  contact_card_title: "Branch contact",
  contact_card_body:
    "Use this section for your public email, intake form, or branch contact instructions. This is the next obvious thing to wire once the homepage editor is in place.",
  member_access_title: "Member access",
  member_access_body:
    "Existing members can use the private branch board for internal updates, documents, meetings, and announcements.",
  primary_actions: [
    { label: "Join Us", url: "#join" },
    { label: "Read the Bulletin", url: "#bulletin" },
    { label: "Member Area", url: "/signin" },
  ],
  get_involved_links: [
    { label: "Contact the branch", url: "#contact" },
    { label: "Get organizing support", url: "#contact" },
    { label: "Member Sign In", url: "/signin" },
  ],
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}

function SectionLink({ id, children, className = "" }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => scrollToSection(id)}
    >
      {children}
    </button>
  )
}

function normalizeUrl(raw) {
  const s = String(raw || "").trim()
  if (!s) return ""
  if (
    s.startsWith("#") ||
    s.startsWith("/") ||
    /^(https?:\/\/|mailto:|tel:|sms:|signal:)/i.test(s)
  ) {
    return s
  }
  return `https://${s}`
}

function cleanLinkObject(item) {
  if (!item || typeof item !== "object") return null
  const label = String(item.label || item.text || "").trim()
  const url = normalizeUrl(item.url || "")
  if (!label || !url) return null
  return { label, url }
}

function cleanLinkArray(arr, limit = 8) {
  return (Array.isArray(arr) ? arr : [])
    .map(cleanLinkObject)
    .filter(Boolean)
    .slice(0, limit)
}

function cleanStringArray(arr, limit = 12) {
  return (Array.isArray(arr) ? arr : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, limit)
}

function cleanJoinCards(arr) {
  const fallback = defaultHome.join_cards
  const items = Array.isArray(arr) ? arr : []
  return fallback.map((def, i) => {
    const raw = items[i] && typeof items[i] === "object" ? items[i] : {}
    return {
      title: String(raw.title || def.title).trim(),
      body: String(raw.body || def.body).trim(),
    }
  })
}

function moveArrayItem(arr, fromIndex, toIndex) {
  const list = Array.isArray(arr) ? arr.slice() : []
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list
  }
  const [moved] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, moved)
  return list
}

function hexToRgb(hex) {
  const clean = String(hex || "").trim().replace("#", "")
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  const n = parseInt(clean, 16)
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  }
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => {
    const n = Math.max(0, Math.min(255, Math.round(v)))
    return n.toString(16).padStart(2, "0")
  }).join("")
}

function darkenHex(hex, amount = 0.2) {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#7b3029"
  return rgbToHex(
    rgb.r * (1 - amount),
    rgb.g * (1 - amount),
    rgb.b * (1 - amount),
  )
}

function normalizeHome(raw) {
  const base = raw && typeof raw === "object" ? raw : {}
  return {
    ...defaultHome,
    ...base,
    branch_label: String(base.branch_label || base.location || defaultHome.branch_label).trim(),
    hero_headline: String(base.hero_headline || base.title || defaultHome.hero_headline).trim(),
    hero_text: String(base.hero_text || base.about || defaultHome.hero_text).trim(),
    about_intro: String(base.about_intro || defaultHome.about_intro).trim(),
    purpose_title: String(base.purpose_title || defaultHome.purpose_title).trim(),
    about_title: String(base.about_title || defaultHome.about_title).trim(),
    join_title: String(base.join_title || defaultHome.join_title).trim(),
    bulletin_title: String(base.bulletin_title || defaultHome.bulletin_title).trim(),
    events_title: String(base.events_title || defaultHome.events_title).trim(),
    contact_title: String(base.contact_title || defaultHome.contact_title).trim(),
    about_card_title: String(base.about_card_title || defaultHome.about_card_title).trim(),
    about_card_body: String(base.about_card_body || base.about_intro || defaultHome.about_card_body).trim(),
    location_card_title: String(base.location_card_title || defaultHome.location_card_title).trim(),
    location_card_body: String(base.location_card_body || base.branch_label || defaultHome.location_card_body).trim(),
    join_intro: String(base.join_intro || defaultHome.join_intro).trim(),
    contact_intro: String(base.contact_intro || defaultHome.contact_intro).trim(),
    events_intro: String(base.events_intro || defaultHome.events_intro).trim(),
    accent_color: String(base.accent_color || defaultHome.accent_color).trim(),
    what_we_do: cleanStringArray(base.what_we_do, 12).length
      ? cleanStringArray(base.what_we_do, 12)
      : defaultHome.what_we_do,
    site_purpose_items: cleanStringArray(base.site_purpose_items, 8).length
      ? cleanStringArray(base.site_purpose_items, 8)
      : defaultHome.site_purpose_items,
    join_cards: cleanJoinCards(base.join_cards),
    events_items: cleanStringArray(base.events_items, 8).length
      ? cleanStringArray(base.events_items, 8)
      : defaultHome.events_items,
    contact_card_title: String(base.contact_card_title || defaultHome.contact_card_title).trim(),
    contact_card_body: String(base.contact_card_body || defaultHome.contact_card_body).trim(),
    member_access_title: String(base.member_access_title || defaultHome.member_access_title).trim(),
    member_access_body: String(base.member_access_body || defaultHome.member_access_body).trim(),
    primary_actions: cleanLinkArray(base.primary_actions, 3).length
      ? cleanLinkArray(base.primary_actions, 3)
      : defaultHome.primary_actions,
    get_involved_links: cleanLinkArray(base.get_involved_links, 6).length
      ? cleanLinkArray(base.get_involved_links, 6)
      : defaultHome.get_involved_links,
    website_link: cleanLinkObject(base.website_link),
    show_action_strip: base.show_action_strip !== false,
    show_what_we_do: base.show_what_we_do !== false,
    show_get_involved: !!(base.show_get_involved ?? defaultHome.show_get_involved),
    show_meetings: base.show_meetings !== false,
    show_newsletter_card: !!base.show_newsletter_card,
    show_website_button: !!base.show_website_button,
  }
}

function runAction(url) {
  const target = String(url || "").trim()
  if (!target) return

  const lowered = target.toLowerCase()

  if (lowered === "newsletter" || lowered === "#newsletter") {
    scrollToSection("contact")
    return
  }

  if (lowered.startsWith("modal:")) {
    scrollToSection("contact")
    return
  }

  if (target.startsWith("#")) {
    scrollToSection(target.slice(1))
    return
  }

  if (target.startsWith("/")) {
    window.location.assign(target)
    return
  }

  window.open(normalizeUrl(target), "_blank", "noopener,noreferrer")
}

function readCurrentOrgId() {
  try {
    const raw = localStorage.getItem("bf_org")
    if (!raw) return ""
    const parsed = JSON.parse(raw)
    return String(parsed?.id || "").trim()
  } catch {
    return ""
  }
}

function InlineTextEdit({
  tag = "div",
  value,
  onChange,
  editorMode,
  className = "",
  multiline = false,
  placeholder = "",
  rows = 4,
}) {
  if (!editorMode) {
    const Tag = tag
    return <Tag className={className}>{value}</Tag>
  }

  if (multiline) {
    return (
      <textarea
        className={`rh-inline-editor rh-inline-editor-textarea ${className}`.trim()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    )
  }

  if (tag === "h1") {
    return (
      <input
        className={`rh-inline-editor rh-inline-editor-h1 ${className}`.trim()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )
  }

  if (tag === "h2") {
    return (
      <input
        className={`rh-inline-editor rh-inline-editor-h2 ${className}`.trim()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )
  }

  return (
    <input
      className={`rh-inline-editor ${className}`.trim()}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function InlineStringListEditor({
  title,
  items,
  onChange,
  editorMode,
  className = "",
  itemPlaceholder = "List item",
  rows = 4,
}) {
  if (!editorMode) {
    return (
      <ul className={className}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className={`rh-inline-group ${className}`.trim()}>
      {title ? <div className="rh-inline-group-label">{title}</div> : null}
      <textarea
        className="rh-inline-editor rh-inline-editor-textarea"
        value={items.join("\n")}
        onChange={(e) =>
          onChange(
            String(e.target.value || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
        placeholder={`${itemPlaceholder}\n${itemPlaceholder}\n${itemPlaceholder}`}
        rows={rows}
      />
    </div>
  )
}

function InlineReorderableStringListEditor({
  title,
  items,
  onChange,
  editorMode,
  className = "",
  itemPlaceholder = "List item",
  maxItems = 12,
}) {
  if (!editorMode) {
    return (
      <ul className={className}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  const safe = Array.isArray(items) ? items.slice(0, maxItems) : []

  return (
    <div className={`rh-inline-group ${className}`.trim()}>
      {title ? <div className="rh-inline-group-label">{title}</div> : null}

      <div className="rh-inline-reorder-list">
        {safe.map((item, index) => (
          <div key={`${title || "item"}-${index}`} className="rh-inline-reorder-row">
            <input
              className="rh-inline-editor"
              value={item || ""}
              onChange={(e) => {
                const next = safe.slice()
                next[index] = e.target.value
                onChange(next)
              }}
              placeholder={itemPlaceholder}
            />
            <div className="rh-inline-reorder-actions">
              <button
                type="button"
                className="rh-inline-move-btn"
                onClick={() => onChange(moveArrayItem(safe, index, index - 1))}
                disabled={index === 0}
                aria-label={`Move ${title || "item"} ${index + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className="rh-inline-move-btn"
                onClick={() => onChange(moveArrayItem(safe, index, index + 1))}
                disabled={index === safe.length - 1}
                aria-label={`Move ${title || "item"} ${index + 1} down`}
              >
                ↓
              </button>
              <button
                type="button"
                className="rh-inline-remove-btn"
                onClick={() => onChange(safe.filter((_, i) => i !== index))}
                aria-label={`Remove ${title || "item"} ${index + 1}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {safe.length < maxItems ? (
        <button
          type="button"
          className="rh-inline-add-btn"
          onClick={() => onChange([...safe, ""])}
        >
          Add item
        </button>
      ) : null}
    </div>
  )
}

function InlineCardBlockEditor({
  title,
  cardTitle,
  cardBody,
  onTitleChange,
  onBodyChange,
  editorMode,
}) {
  if (!editorMode) {
    return (
      <>
        <h3>{cardTitle}</h3>
        <p>{cardBody}</p>
      </>
    )
  }

  return (
    <div className="rh-inline-group">
      {title ? <div className="rh-inline-group-label">{title}</div> : null}
      <input
        className="rh-inline-editor"
        value={cardTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Card title"
      />
      <textarea
        className="rh-inline-editor rh-inline-editor-textarea"
        value={cardBody}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Card body"
        rows={4}
      />
    </div>
  )
}

function InlineActionListEditor({
  title,
  items,
  onChange,
  editorMode,
  limit = 3,
}) {
  if (!editorMode) return null

  const safe = Array.isArray(items) ? items.slice(0, limit) : []
  while (safe.length < limit) safe.push({ label: "", url: "" })

  return (
    <div className="rh-inline-group">
      {title ? <div className="rh-inline-group-label">{title}</div> : null}
      <div className="rh-inline-actions-grid">
        {safe.map((item, index) => (
          <div key={`${title || "action"}-${index}`} className="rh-inline-action-card">
            <div className="rh-inline-action-head">
              <div className="rh-inline-group-label">Button {index + 1}</div>
              <div className="rh-inline-reorder-actions">
                <button
                  type="button"
                  className="rh-inline-move-btn"
                  onClick={() => onChange(moveArrayItem(safe, index, index - 1))}
                  disabled={index === 0}
                  aria-label={`Move button ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rh-inline-move-btn"
                  onClick={() => onChange(moveArrayItem(safe, index, index + 1))}
                  disabled={index === safe.length - 1}
                  aria-label={`Move button ${index + 1} down`}
                >
                  ↓
                </button>
              </div>
            </div>
            <input
              className="rh-inline-editor"
              value={item.label || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === index ? { ...x, label: e.target.value } : x)
                onChange(next)
              }}
              placeholder="Button label"
            />
            <input
              className="rh-inline-editor"
              value={item.url || ""}
              onChange={(e) => {
                const next = safe.map((x, i) => i === index ? { ...x, url: e.target.value } : x)
                onChange(next)
              }}
              placeholder="#join or /signin or https://..."
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RedHarborHome() {
  const [home, setHome] = React.useState(defaultHome)
  const [draft, setDraft] = React.useState(null)
  const [posts, setPosts] = React.useState([])
  const [bulletinError, setBulletinError] = React.useState("")
  const [siteError, setSiteError] = React.useState("")
  const [editorAvailable, setEditorAvailable] = React.useState(false)
  const [editorMode, setEditorMode] = React.useState(false)
  const [saveBusy, setSaveBusy] = React.useState(false)
  const [saveMsg, setSaveMsg] = React.useState("")
  const [isDirty, setIsDirty] = React.useState(false)
  const [currentOrgId, setCurrentOrgId] = React.useState("")

  React.useEffect(() => {
    let ignore = false

    async function loadHome() {
      try {
        const res = await fetch(`/api/public-home/${ORG_ID}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || data?.error || "Failed to load site settings")
        }
        if (!ignore) {
          setHome(normalizeHome(data.public || {}))
        }
      } catch (err) {
        if (!ignore) {
          setSiteError(String(err?.message || err || "Failed to load site settings"))
        }
      }
    }

    async function loadBulletin() {
      try {
        const res = await fetch(`/api/public/bulletin?org=${ORG_SLUG}&limit=3`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || "Failed to load bulletin")
        }
        if (!ignore) {
          setPosts(Array.isArray(data.posts) ? data.posts : [])
        }
      } catch (err) {
        if (!ignore) {
          setBulletinError(String(err?.message || err || "Failed to load bulletin"))
        }
      }
    }

    async function checkEditor() {
      const orgId = readCurrentOrgId()
      if (!ignore) setCurrentOrgId(orgId || "")
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        })
        const data = await res.json().catch(() => ({}))
        if (!ignore) {
          setEditorAvailable(!!(res.ok && data?.ok))
        }
      } catch {
        if (!ignore) {
          setEditorAvailable(false)
        }
      }
    }

    loadHome()
    loadBulletin()
    checkEditor()

    return () => {
      ignore = true
    }
  }, [])

  let liveHome
  try {
    liveHome = draft ? normalizeHome(draft) : home
  } catch (e) {
    console.error("normalizeHome crash:", e)
    liveHome = home || {}
  }

  const whatWeDoItems = React.useMemo(() => cleanStringArray(liveHome.what_we_do, 8), [liveHome.what_we_do])
  const purposeItems = React.useMemo(() => cleanStringArray(liveHome.site_purpose_items, 8), [liveHome.site_purpose_items])
  const eventItems = React.useMemo(() => cleanStringArray(liveHome.events_items, 8), [liveHome.events_items])
  const primaryActions = React.useMemo(() => cleanLinkArray(liveHome.primary_actions, 3), [liveHome.primary_actions])
  const involvedActions = React.useMemo(() => cleanLinkArray(liveHome.get_involved_links, 6), [liveHome.get_involved_links])

  const accent = liveHome.accent_color || defaultHome.accent_color
  const accentDark = darkenHex(accent, 0.22)

  const startEditing = React.useCallback(() => {
    setDraft(normalizeHome({ ...home }))
    setEditorMode(true)
    setSaveMsg("")
  }, [home])

  const cancelEditing = React.useCallback(() => {
    setDraft(null)
    setEditorMode(false)
    setSaveBusy(false)
    setIsDirty(false)
    setSaveMsg("")
  }, [])

  const doneEditing = React.useCallback(() => {
    setDraft(null)
    setEditorMode(false)
    setSaveBusy(false)
    setIsDirty(false)
    setSaveMsg("")
  }, [])

  const updateDraft = React.useCallback((key, value) => {
    setIsDirty(true)
    setDraft((prev) => normalizeHome({ ...(prev || home), [key]: value }))
  }, [home])

  const updateJoinCard = React.useCallback((index, patch) => {
    setDraft((prev) => {
      const src = normalizeHome(prev || home)
      setIsDirty(true)
      const next = src.join_cards.map((card, i) => (i === index ? { ...card, ...patch } : card))
      return normalizeHome({ ...src, join_cards: next })
    })
  }, [home])

  const updateActionList = React.useCallback((key, items, limit = 3) => {
    setDraft((prev) => {
      const src = normalizeHome(prev || home)
      setIsDirty(true)
      const cleaned = (Array.isArray(items) ? items : [])
        .slice(0, limit)
        .map((item) => ({
          label: String(item?.label || "").trim(),
          url: String(item?.url || "").trim(),
        }))
        .filter((item) => item.label && item.url)
      return normalizeHome({ ...src, [key]: cleaned })
    })
  }, [home])


  React.useEffect(() => {
    if (!editorMode) return

    const handler = (e) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [editorMode, isDirty])

  const saveDraft = React.useCallback(async () => {
    console.log("RH SAVE CLICK", {
      orgId: ORG_ID,
      currentOrgId,
      draftFont: draft?.font_family,
      homeFont: home?.font_family,
    })

    try {
      const orgId = ORG_ID
      console.log("RH SAVE STEP 1 orgId", orgId)

      if (!orgId) {
        setSaveMsg("No org context found for saving.")
        console.error("RH SAVE STOP no orgId")
        return
      }

      console.log("RH SAVE STEP 2 before normalizeHome")
      const src = normalizeHome(draft || home)
      console.log("RH SAVE STEP 3 after normalizeHome", {
        font_family: src?.font_family,
        accent_color: src?.accent_color,
      })

      const payload = {
        newsletter_enabled: !!src.newsletter_enabled,
        show_action_strip: !!src.show_action_strip,
        show_needs: !!src.show_needs,
        show_meetings: !!src.show_meetings,
        show_what_we_do: !!src.show_what_we_do,
        show_get_involved: !!src.show_get_involved,
        show_newsletter_card: !!src.show_newsletter_card,
        show_website_button: !!src.show_website_button,
        title: src.hero_headline,
        location: src.branch_label,
        about: src.hero_text,
        branch_label: src.branch_label,
        hero_headline: src.hero_headline,
        hero_text: src.hero_text,
        about_intro: src.about_intro,
        purpose_title: src.purpose_title,
        about_title: src.about_title,
        join_title: src.join_title,
        bulletin_title: src.bulletin_title,
        events_title: src.events_title,
        contact_title: src.contact_title,
        about_card_title: src.about_card_title,
        about_card_body: src.about_card_body,
        location_card_title: src.location_card_title,
        location_card_body: src.location_card_body,
        join_intro: src.join_intro,
        contact_intro: src.contact_intro,
        events_intro: src.events_intro,
        font_family: src.font_family,
        accent_color: src.accent_color,
        what_we_do: src.what_we_do,
        site_purpose_items: src.site_purpose_items,
        join_cards: src.join_cards,
        events_items: src.events_items,
        contact_card_title: src.contact_card_title,
        contact_card_body: src.contact_card_body,
        member_access_title: src.member_access_title,
        member_access_body: src.member_access_body,
        primary_actions: src.primary_actions,
        get_involved_links: src.get_involved_links,
      }

      console.log("RH SAVE STEP 4 payload ready", payload)
      setSaveBusy(true)
      setSaveMsg("")

      console.log("RH SAVE STEP 5 before fetch")
      const res = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/public/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
      console.log("RH SAVE STEP 6 fetch returned", res.status)

      const data = await res.json().catch(() => ({}))
      console.log("RH SAVE STEP 7 response json", data)

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.detail || data?.error || data?.message || "Failed to save page")
      }

      const savedHome = normalizeHome(data.public || payload)
      console.log("RH SAVE STEP 8 savedHome", savedHome)

      setHome(savedHome)
      try {
        if (savedHome?.font_family) {
          localStorage.setItem('rh_font_family', savedHome.font_family)
        }
      } catch (e) {
        console.warn("font localStorage failed", e)
      }
      setDraft(null)
      setIsDirty(false)
      setSaveMsg("Saved")
      setEditorMode(false)

      try {
        console.log("RH SAVE STEP 9 verify fetch start")
        const verifyRes = await fetch(`/api/public-home/${ORG_ID}?t=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        })
        console.log("RH SAVE STEP 10 verify fetch returned", verifyRes.status)
        const verifyData = await verifyRes.json().catch(() => ({}))
        console.log("RH SAVE STEP 11 verify json", verifyData)
        if (verifyRes.ok && verifyData?.ok !== false && verifyData?.public) {
          const verifiedHome = normalizeHome(verifyData.public)
          console.log("RH SAVE STEP 12 apply verified home", verifiedHome)
          setHome(verifiedHome)
        }
      } catch (verifyErr) {
        console.warn("public-home verification skipped", verifyErr)
      }

      setTimeout(() => setSaveMsg(""), 1800)
    } catch (err) {
      console.error("RH SAVE FAILED", err)
      setSaveMsg(String(err?.message || err || "Failed to save page"))
    } finally {
      setSaveBusy(false)
    }
  }, [currentOrgId, draft, home])

  return (
    <div
      className={`rh-public rh-font-${liveHome.font_family || "system"} ${editorMode ? "rh-editor-mode" : ""}`}
      style={{
        "--rh-accent": accent,
        "--rh-red": accent,
        "--rh-red-2": accentDark,
      }}
    >
      <header className="rh-public-header">
        <div className="rh-public-brand">
          <img
            src="/red-harbor-logo.png"
            alt="Red Harbor logo"
            className="rh-public-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
          <div className="rh-public-brandtext">
            <div className="rh-public-kicker">Industrial Workers of the World</div>
            <div className="rh-public-title">Red Harbor</div>
          </div>
        </div>

        <nav className="rh-public-nav" aria-label="Primary">
          <SectionLink id="about" className="rh-nav-link">About</SectionLink>
          <SectionLink id="join" className="rh-nav-link">Join</SectionLink>
          <SectionLink id="bulletin" className="rh-nav-link">Bulletin</SectionLink>
          {liveHome.show_meetings ? <SectionLink id="events" className="rh-nav-link">Events</SectionLink> : null}
          <SectionLink id="contact" className="rh-nav-link">Contact</SectionLink>
          {editorAvailable && !editorMode ? (
            <button type="button" className="rh-signin-link rh-editor-toggle" onClick={startEditing}>
              Edit page
            </button>
          ) : null}
          <Link to="/signin" className="rh-signin-link">Member Sign In</Link>
        </nav>
      </header>

      {editorMode ? (
        <>
          <div className="rh-editor-toolbar">
            <div className="rh-editor-toolbar-left">
              <strong>Editor mode</strong>
              <span className="rh-editor-toolbar-note">Inline editing for public page copy, fonts, color, and buttons.</span>
            </div>
            <div className="rh-editor-toolbar-actions">
              <label className="rh-editor-font">
                <span>Font</span>
                <select
                value={liveHome.font_family || "system"}
                onChange={(e) => updateDraft("font_family", e.target.value)}
              >
                <option value="system">System</option>
                <option value="inter">Inter</option>
                <option value="plex">IBM Plex Sans</option>
                <option value="manrope">Manrope</option>
                <option value="archivo">Archivo</option>
                <option value="space">Space Grotesk</option>
                <option value="oswald">Oswald</option>
                <option value="bebas">Bebas Neue</option>
                <option value="serif">Source Serif 4</option>
                <option value="playfair">Playfair Display</option>
                <option value="fraunces">Fraunces</option>
                <option value="cormorant">Cormorant Garamond</option>
                <option value="altehaas">Alte Haas Grotesk</option>
              </select>
              </label>

              <label className="rh-editor-color">
                <span>Accent</span>
                <input
                  type="color"
                  value={liveHome.accent_color || defaultHome.accent_color}
                  onChange={(e) => updateDraft("accent_color", e.target.value)}
                />
              </label>
              {saveMsg ? <span className={saveMsg.includes("Saved") ? "rh-editor-success" : "rh-editor-error"}>{saveMsg}</span> : null}
              <button
                type="button"
                className="rh-btn rh-btn-ghost"
                onClick={doneEditing}
                disabled={saveBusy || isDirty}
              >
                Done
              </button>
              <button
                type="button"
                className="rh-btn rh-btn-ghost"
                onClick={cancelEditing}
                disabled={saveBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rh-btn rh-btn-primary"
                onClick={() => {
                  console.log("RH SAVE BUTTON PRESSED")
                  saveDraft()
                }}
                disabled={saveBusy}
              >
                {saveBusy ? "Saving…" : "Save and exit"}
              </button>
            </div>
          </div>

          <div className="rh-editor-panels">
            <div className="rh-editor-panel">
              <InlineActionListEditor
                title="Hero buttons"
                items={liveHome.primary_actions}
                onChange={(items) => updateActionList("primary_actions", items, 3)}
                editorMode={editorMode}
                limit={3}
              />
            </div>

            <div className="rh-editor-panel">
              <InlineActionListEditor
                title="Join action links"
                items={liveHome.get_involved_links}
                onChange={(items) => updateActionList("get_involved_links", items, 3)}
                editorMode={editorMode}
                limit={3}
              />
            </div>
          </div>
        </>
      ) : null}

      <main>
        <section className="rh-hero">
          <div className="rh-hero-copy">
            <InlineTextEdit
              tag="p"
              className="rh-eyebrow"
              editorMode={editorMode}
              value={liveHome.branch_label || defaultHome.branch_label}
              onChange={(value) => updateDraft("branch_label", value)}
              placeholder="Red Harbor Branch"
            />
            <InlineTextEdit
              tag="h1"
              className=""
              editorMode={editorMode}
              value={liveHome.hero_headline || defaultHome.hero_headline}
              onChange={(value) => updateDraft("hero_headline", value)}
              placeholder="Building worker power on the harbor and beyond."
            />
            <InlineTextEdit
              tag="p"
              className="rh-lead"
              multiline
              editorMode={editorMode}
              value={liveHome.hero_text || defaultHome.hero_text}
              onChange={(value) => updateDraft("hero_text", value)}
              placeholder="Hero supporting text"
            />

            {liveHome.show_action_strip && primaryActions.length > 0 ? (
              <div className="rh-hero-actions">
                {primaryActions.map((action, index) => {
                  const cls =
                    index === 0
                      ? "rh-btn rh-btn-primary"
                      : index === 1
                        ? "rh-btn rh-btn-secondary"
                        : "rh-btn rh-btn-ghost"

                  if (String(action.url || "").startsWith("/")) {
                    return (
                      <Link key={`${action.label}-${index}`} to={action.url} className={cls}>
                        {action.label}
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={`${action.label}-${index}`}
                      type="button"
                      className={cls}
                      onClick={() => runAction(action.url)}
                    >
                      {action.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <aside className="rh-hero-card">
            <InlineTextEdit
              tag="h2"
              className=""
              editorMode={editorMode}
              value={liveHome.purpose_title || defaultHome.purpose_title}
              onChange={(value) => updateDraft("purpose_title", value)}
              placeholder="What this site is for"
            />
            <InlineStringListEditor
              items={purposeItems}
              onChange={(items) => updateDraft("site_purpose_items", items)}
              editorMode={editorMode}
              itemPlaceholder="Purpose item"
              rows={6}
            />
            {siteError ? (
              <p className="rh-note" style={{ marginTop: 12 }}>
                {siteError}
              </p>
            ) : null}
          </aside>
        </section>

        <section id="about" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">About</p>
            <InlineTextEdit
              tag="h2"
              className=""
              editorMode={editorMode}
              value={liveHome.about_title || defaultHome.about_title}
              onChange={(value) => updateDraft("about_title", value)}
              placeholder="About Red Harbor"
            />
            <InlineTextEdit
              tag="p"
              className="rh-section-copy"
              multiline
              editorMode={editorMode}
              value={liveHome.about_intro || defaultHome.about_intro}
              onChange={(value) => updateDraft("about_intro", value)}
              placeholder="About section intro"
            />
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <InlineCardBlockEditor
                title={editorMode ? "About card" : ""}
                cardTitle={liveHome.about_card_title || defaultHome.about_card_title}
                cardBody={liveHome.about_card_body || defaultHome.about_card_body}
                onTitleChange={(value) => updateDraft("about_card_title", value)}
                onBodyChange={(value) => updateDraft("about_card_body", value)}
                editorMode={editorMode}
              />
            </div>

            <div className="rh-card">
              <InlineCardBlockEditor
                title={editorMode ? "Location card" : ""}
                cardTitle={liveHome.location_card_title || defaultHome.location_card_title}
                cardBody={liveHome.location_card_body || defaultHome.location_card_body}
                onTitleChange={(value) => updateDraft("location_card_title", value)}
                onBodyChange={(value) => updateDraft("location_card_body", value)}
                editorMode={editorMode}
              />
            </div>

            {liveHome.show_what_we_do && whatWeDoItems.length > 0 ? (
              <div className="rh-card" style={{ gridColumn: "1 / -1" }}>
                <h3>What we do</h3>
                {editorMode ? (
                  <InlineReorderableStringListEditor
                    title="What we do items"
                    items={whatWeDoItems}
                    onChange={(items) => updateDraft("what_we_do", items)}
                    editorMode={editorMode}
                    itemPlaceholder="What we do item"
                    maxItems={12}
                  />
                ) : (
                  <div className="rh-grid-two">
                    {whatWeDoItems.map((item) => (
                      <div key={item} className="rh-card">
                        <p style={{ margin: 0 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section id="join" className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Join</p>
            <InlineTextEdit
              tag="h2"
              className=""
              editorMode={editorMode}
              value={liveHome.join_title || defaultHome.join_title}
              onChange={(value) => updateDraft("join_title", value)}
              placeholder="Organize with us"
            />
            <InlineTextEdit
              tag="p"
              className="rh-section-copy"
              multiline
              editorMode={editorMode}
              value={liveHome.join_intro || defaultHome.join_intro}
              onChange={(value) => updateDraft("join_intro", value)}
              placeholder="Join section intro"
            />
          </div>

          <div className="rh-grid-three">
            {liveHome.join_cards.map((card, index) => {
              const action = (liveHome.show_get_involved && involvedActions.length > 0 ? involvedActions : defaultHome.get_involved_links)[index]
              return (
                <article className="rh-card" key={`${card.title}-${index}`}>
                  <InlineCardBlockEditor
                    title={editorMode ? `Join card ${index + 1}` : ""}
                    cardTitle={card.title}
                    cardBody={card.body}
                    onTitleChange={(value) => updateJoinCard(index, { title: value })}
                    onBodyChange={(value) => updateJoinCard(index, { body: value })}
                    editorMode={editorMode}
                  />
                  {action ? (
                    String(action.url || "").startsWith("/") ? (
                      <Link to={action.url} className="rh-inline-link">{action.label}</Link>
                    ) : (
                      <button
                        type="button"
                        className="rh-inline-link"
                        style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}
                        onClick={() => runAction(action.url)}
                      >
                        {action.label}
                      </button>
                    )
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        <section id="bulletin" className="rh-section">
          <div className="rh-bulletin-home">
            <div className="rh-bulletin-home-intro">
              <div className="rh-section-head">
                <p className="rh-section-kicker">Bulletin</p>
                <InlineTextEdit
                  tag="h2"
                  className=""
                  editorMode={editorMode}
                  value={liveHome.bulletin_title || defaultHome.bulletin_title}
                  onChange={(value) => updateDraft("bulletin_title", value)}
                  placeholder="Publications and updates"
                />
              </div>

              <div className="rh-bulletin-home-actions">
                <Link to="/bulletin" className="rh-btn rh-btn-secondary">Browse all bulletin posts</Link>
              </div>

              {bulletinError ? (
                <div className="rh-note-wrap">
                  <p className="rh-note">{bulletinError}</p>
                </div>
              ) : null}
            </div>

            <div className="rh-bulletin-home-list">
              {posts.map((post) => (
                <article className="rh-card rh-bulletin-home-card" key={post.id}>
                  <div className="rh-bulletin-home-date">
                    {post.publishedAt || post.updatedAt || ""}
                  </div>
                  <h3 className="rh-bulletin-home-card-title">{post.title}</h3>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                  <Link to={`/bulletin/${post.slug}`} className="rh-inline-link">Read post</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {liveHome.show_meetings ? (
          <section id="events" className="rh-section rh-section-band">
            <div className="rh-section-head">
              <p className="rh-section-kicker">Events</p>
              <InlineTextEdit
                tag="h2"
                className=""
                editorMode={editorMode}
                value={liveHome.events_title || defaultHome.events_title}
                onChange={(value) => updateDraft("events_title", value)}
                placeholder="Meetings and public activity"
              />
              <InlineTextEdit
                tag="p"
                className="rh-section-copy"
                multiline
                editorMode={editorMode}
                value={liveHome.events_intro || defaultHome.events_intro}
                onChange={(value) => updateDraft("events_intro", value)}
                placeholder="Events section intro"
              />
            </div>
            <div className="rh-card">
              <InlineStringListEditor
                items={eventItems}
                onChange={(items) => updateDraft("events_items", items)}
                editorMode={editorMode}
                className="rh-event-list"
                itemPlaceholder="Event list item"
                rows={6}
              />
            </div>
          </section>
        ) : null}

        <section id="contact" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Contact</p>
            <InlineTextEdit
              tag="h2"
              className=""
              editorMode={editorMode}
              value={liveHome.contact_title || defaultHome.contact_title}
              onChange={(value) => updateDraft("contact_title", value)}
              placeholder="Get in touch"
            />
            <InlineTextEdit
              tag="p"
              className="rh-section-copy"
              multiline
              editorMode={editorMode}
              value={liveHome.contact_intro || defaultHome.contact_intro}
              onChange={(value) => updateDraft("contact_intro", value)}
              placeholder="Contact section intro"
            />
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <InlineCardBlockEditor
                title={editorMode ? "Contact card" : ""}
                cardTitle={liveHome.contact_card_title || defaultHome.contact_card_title}
                cardBody={liveHome.contact_card_body || defaultHome.contact_card_body}
                onTitleChange={(value) => updateDraft("contact_card_title", value)}
                onBodyChange={(value) => updateDraft("contact_card_body", value)}
                editorMode={editorMode}
              />
            </div>

            <div className="rh-card">
              <InlineCardBlockEditor
                title={editorMode ? "Member access card" : ""}
                cardTitle={liveHome.member_access_title || defaultHome.member_access_title}
                cardBody={liveHome.member_access_body || defaultHome.member_access_body}
                onTitleChange={(value) => updateDraft("member_access_title", value)}
                onBodyChange={(value) => updateDraft("member_access_body", value)}
                editorMode={editorMode}
              />
              <Link to="/signin" className="rh-btn rh-btn-primary">Go to Member Sign In</Link>
            </div>
          </div>

          {liveHome.show_newsletter_card ? (
            <div className="rh-note-wrap" style={{ marginTop: 16 }}>
              <p className="rh-note">
                Newsletter visibility is enabled in Site settings. The next pass can wire the actual signup block directly into this home page.
              </p>
            </div>
          ) : null}
        </section>
      </main>

      <footer className="rh-public-footer">
        <div>
          <strong>Red Harbor</strong>
          <p>Industrial Workers of the World</p>
        </div>
        <div className="rh-footer-links">
          <SectionLink id="about" className="rh-footer-link-button">About</SectionLink>
          <SectionLink id="join" className="rh-footer-link-button">Join</SectionLink>
          <SectionLink id="bulletin" className="rh-footer-link-button">Bulletin</SectionLink>
          {liveHome.show_meetings ? <SectionLink id="events" className="rh-footer-link-button">Events</SectionLink> : null}
          <SectionLink id="contact" className="rh-footer-link-button">Contact</SectionLink>
          <Link to="/signin">Member Sign In</Link>
        </div>
      </footer>
    </div>
  )
}
