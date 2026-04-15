import React from "react"
import { Link } from "react-router-dom"
import "../styles/redharbor-public-pass1.css"

const ORG_ID = "red-harbor"
const ORG_SLUG = "red-harbor"

const defaultEvents = [
  "Branch meetings and public events will be posted here.",
  "Workplace organizing support and one to one follow up available.",
  "Bulletin updates and announcements published on a regular basis.",
]

const defaultHome = {
  title: "Building worker power on the harbor and beyond.",
  location: "Red Harbor Branch",
  about:
    "Red Harbor is a branch of the Industrial Workers of the World. We organize across workplaces, support workers in struggle, publish branch updates, and build solidarity rooted in direct action and rank and file power.",
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
    title: String(base.title || defaultHome.title).trim(),
    location: String(base.location || defaultHome.location).trim(),
    about: String(base.about || defaultHome.about).trim(),
    accent_color: String(base.accent_color || defaultHome.accent_color).trim(),
    what_we_do: cleanStringArray(base.what_we_do, 12).length
      ? cleanStringArray(base.what_we_do, 12)
      : defaultHome.what_we_do,
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

export default function RedHarborHome() {
  const [home, setHome] = React.useState(defaultHome)
  const [posts, setPosts] = React.useState([])
  const [bulletinError, setBulletinError] = React.useState("")
  const [siteError, setSiteError] = React.useState("")

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

    loadHome()
    loadBulletin()

    return () => {
      ignore = true
    }
  }, [])

  const whatWeDoItems = React.useMemo(() => {
    return cleanStringArray(home.what_we_do, 8)
  }, [home.what_we_do])

  const primaryActions = React.useMemo(() => {
    return cleanLinkArray(home.primary_actions, 3)
  }, [home.primary_actions])

  const involvedActions = React.useMemo(() => {
    return cleanLinkArray(home.get_involved_links, 6)
  }, [home.get_involved_links])

  const accent = home.accent_color || defaultHome.accent_color
  const accentDark = darkenHex(accent, 0.22)

  return (
    <div
      className="rh-public"
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
          {home.show_meetings ? <SectionLink id="events" className="rh-nav-link">Events</SectionLink> : null}
          <SectionLink id="contact" className="rh-nav-link">Contact</SectionLink>
          {home.show_website_button && home.website_link?.url ? (
            <a
              href={home.website_link.url}
              className="rh-signin-link"
              target="_blank"
              rel="noreferrer"
            >
              {home.website_link.label || "Website"}
            </a>
          ) : null}
          <Link to="/signin" className="rh-signin-link">Member Sign In</Link>
        </nav>
      </header>

      <main>
        <section className="rh-hero">
          <div className="rh-hero-copy">
            <p className="rh-eyebrow">{home.location || defaultHome.location}</p>
            <h1>{home.title || defaultHome.title}</h1>
            <p className="rh-lead">
              {home.about || defaultHome.about}
            </p>

            {home.show_action_strip && primaryActions.length > 0 ? (
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
            <h2>What this site is for</h2>
            <ul>
              <li>Learn what the branch is and what it does</li>
              <li>Find organizing and membership information</li>
              <li>Read public updates and branch publications</li>
              <li>Access the private branch board through sign in</li>
            </ul>
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
            <h2>About Red Harbor</h2>
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>Branch overview</h3>
              <p>{home.about || defaultHome.about}</p>
            </div>

            <div className="rh-card">
              <h3>Location</h3>
              <p>{home.location || "Grays Harbor and the surrounding region."}</p>
            </div>

            {home.show_what_we_do && whatWeDoItems.length > 0 ? (
              <div className="rh-card" style={{ gridColumn: "1 / -1" }}>
                <h3>What we do</h3>
                <div className="rh-grid-two">
                  {whatWeDoItems.map((item) => (
                    <div key={item} className="rh-card">
                      <p style={{ margin: 0 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="join" className="rh-section rh-section-band">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Join</p>
            <h2>Organize with us</h2>
          </div>

          <div className="rh-grid-three">
            {(home.show_get_involved && involvedActions.length > 0 ? involvedActions : defaultHome.get_involved_links).map((item) => (
              <article className="rh-card" key={`${item.label}-${item.url}`}>
                <h3>{item.label}</h3>
                <p>
                  Use this action to connect with the branch, get involved, or move toward organizing with others.
                </p>
                {String(item.url || "").startsWith("/") ? (
                  <Link to={item.url} className="rh-inline-link">{item.label}</Link>
                ) : (
                  <button
                    type="button"
                    className="rh-inline-link"
                    style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}
                    onClick={() => runAction(item.url)}
                  >
                    {item.label}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="bulletin" className="rh-section">
          <div className="rh-bulletin-home">
            <div className="rh-bulletin-home-intro">
              <div className="rh-section-head">
                <p className="rh-section-kicker">Bulletin</p>
                <h2>Publications and updates</h2>
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

        {home.show_meetings ? (
          <section id="events" className="rh-section rh-section-band">
            <div className="rh-section-head">
              <p className="rh-section-kicker">Events</p>
              <h2>Meetings and public activity</h2>
            </div>
            <div className="rh-card">
              <ul className="rh-event-list">
                {defaultEvents.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section id="contact" className="rh-section">
          <div className="rh-section-head">
            <p className="rh-section-kicker">Contact</p>
            <h2>Get in touch</h2>
          </div>

          <div className="rh-grid-two">
            <div className="rh-card">
              <h3>Branch contact</h3>
              <p>
                Use this section for your public email, intake form, or branch contact instructions.
                This is the next obvious thing to wire once the homepage editor is in place.
              </p>
              {home.show_website_button && home.website_link?.url ? (
                <a
                  href={home.website_link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rh-btn rh-btn-secondary"
                >
                  {home.website_link.label || "Website"}
                </a>
              ) : null}
            </div>

            <div className="rh-card">
              <h3>Member access</h3>
              <p>
                Existing members can use the private branch board for internal updates,
                documents, meetings, and announcements.
              </p>
              <Link to="/signin" className="rh-btn rh-btn-primary">Go to Member Sign In</Link>
            </div>
          </div>

          {home.show_newsletter_card ? (
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
          {home.show_meetings ? <SectionLink id="events" className="rh-footer-link-button">Events</SectionLink> : null}
          <SectionLink id="contact" className="rh-footer-link-button">Contact</SectionLink>
          <Link to="/signin">Member Sign In</Link>
        </div>
      </footer>
    </div>
  )
}
