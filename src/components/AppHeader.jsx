import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getOrgModules } from "../lib/orgPacks.js";
import { getAppMode } from "../lib/appMode";

const homeHref = "/orgs";

function useOrgIdFromPath() {
  const loc = useLocation();
  const pathname = loc.pathname || "";
  const hash = loc.hash || "";

  const m1 = pathname.match(/\/org\/([^/]+)/i);
  const m2 = hash.match(/#\/org\/([^/]+)/i);

  const raw = (m1 && m1[1]) || (m2 && m2[1]) || null;
  return raw ? decodeURIComponent(raw) : null;
}

function readOrgName(orgId) {
  if (!orgId) return "";
  try {
    const s = JSON.parse(localStorage.getItem(`bf_org_settings_${orgId}`) || "{}");
    const orgs = JSON.parse(localStorage.getItem("bf_orgs") || "[]");
    const o = Array.isArray(orgs) ? orgs.find((x) => x?.id === orgId) : null;
    return String((s?.name || o?.name || "").trim() || "");
  } catch {
    return "";
  }
}

function readOrgLogo(orgId) {
  if (!orgId) return null;
  try {
    const s = JSON.parse(localStorage.getItem(`bf_org_settings_${orgId}`) || "{}");
    const v = s?.logoDataUrl || s?.logoUrl || s?.logo || null;
    const str = String(v || "").trim();
    return str ? str : null;
  } catch {
    return null;
  }
}

const Brand = ({ orgId, logoSrc }) => {
  const inferredOrgId = orgId || useOrgIdFromPath();
  const [orgName, setOrgName] = React.useState(() => readOrgName(inferredOrgId));
  const [orgLogo, setOrgLogo] = React.useState(() => readOrgLogo(inferredOrgId));

  React.useEffect(() => {
    const sync = () => {
      setOrgName(readOrgName(inferredOrgId));
      setOrgLogo(readOrgLogo(inferredOrgId));
    };

    sync();

    const onChange = (e) => {
      const changedId = e?.detail?.orgId;
      if (!changedId || changedId === inferredOrgId) sync();
    };

    const onStorage = (e) => {
      const k = e?.key || "";
      if (k === `bf_org_settings_${inferredOrgId}` || k === "bf_orgs") sync();
    };

    window.addEventListener("bf:org_settings_changed", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bf:org_settings_changed", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [inferredOrgId]);

  const appMode = getAppMode();
  const brandLabel = appMode === "red-harbor" ? "IWW RED HARBOR" : "Bondfire";
  const secondaryLabel = String(orgName || "").trim();
  const showSecondary =
    inferredOrgId &&
    secondaryLabel &&
    secondaryLabel.toLowerCase() !== brandLabel.toLowerCase();

  const imgSrc = logoSrc || "/red-harbor-logo.png";

  return (
    <div
      className="bf-brand-wrap"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Link
        className="bf-brand"
        to={homeHref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
          flex: "0 1 auto",
        }}
      >
        <img
          src={imgSrc}
          alt="Red Harbor logo"
          className="bf-org-logo"
          style={{ flex: "0 0 auto" }}
        />
        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            maxWidth: "100%",
          }}
        >
          {brandLabel}
        </span>
      </Link>

      {showSecondary ? (
        <span
          className="bf-brand-org"
          title={secondaryLabel}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            maxWidth: 220,
            overflow: "hidden",
            flex: "0 1 auto",
          }}
        >
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={`${secondaryLabel} logo`}
              className="bf-org-logo"
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.06)",
                flex: "0 0 auto",
              }}
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <span
            className="bf-org-name"
            style={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            {secondaryLabel}
          </span>
        </span>
      ) : null}
    </div>
  );
};

function OrgNav({ variant = "drawer" }) {
  const orgId = useOrgIdFromPath();
  const isDrawer = variant === "drawer";

  const navStyle = isDrawer
    ? {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 14,
      }
    : {
        display: "none",
      };

  const drawerLinkStyle = {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    fontWeight: 700,
    textDecoration: "none",
  };

  const appMode = getAppMode();
  const isRedHarbor = appMode === "red-harbor";
  const base = orgId ? `/org/${orgId}` : null;
  const enabled = orgId ? getOrgModules(orgId) : [];
  const defs = isRedHarbor
    ? [
        ["overview", "Branch Board", `${base}/overview`, "nav-branch-board"],
        ["people", "Members", `${base}/people`, "nav-members"],
        ["inventory", "Supplies", `${base}/inventory`, "nav-supplies"],
        ["needs", "Requests", `${base}/needs`, "nav-requests"],
        ["meetings", "Meetings", `${base}/meetings`, "nav-meetings"],
        ["drive", "Documents", `${base}/drive`, "nav-documents"],
        ["studio", "Studio", `${base}/studio`, "nav-studio"],
        ["settings", "Settings", `${base}/settings`, "nav-settings"],
      ]
    : [
        ["overview", "Dashboard", `${base}/overview`, "nav-overview"],
        ["people", "People", `${base}/people`, "nav-people"],
        ["inventory", "Inventory", `${base}/inventory`, "nav-inventory"],
        ["needs", "Needs", `${base}/needs`, "nav-needs"],
        ["meetings", "Meetings", `${base}/meetings`, "nav-meetings"],
        ["drive", "Drive", `${base}/drive`, "nav-drive"],
        ["studio", "Studio", `${base}/studio`, "nav-studio"],
        ["settings", "Settings", `${base}/settings`, "nav-settings"],
        ["public", "Public Page", `${base}/public`, "nav-public"],
      ];

  const items = base
    ? defs
        .filter(([key]) => isRedHarbor ? (key === "bulletin" || enabled.includes(key)) : enabled.includes(key))
        .map(([, label, to, tourId]) => [label, to, tourId])
    : [];

  return (
    <nav
      className={`bf-appnav${isDrawer ? " is-drawer" : ""}`}
      aria-label="Org navigation"
      style={navStyle}
      data-bf-orgnav={isDrawer ? "drawer" : "desktop"}
    >
      {items.map(([label, to, tourId]) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            ...drawerLinkStyle,
            background: isActive ? "rgba(255,0,0,0.20)" : drawerLinkStyle.background,
            border: isActive ? "1px solid rgba(255,0,0,0.30)" : drawerLinkStyle.border,
          })}
          className={({ isActive }) => `bf-appnav-link${isActive ? " is-active" : ""}`}
          data-tour={tourId}
          title={label}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppHeader({ onLogout, showLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const loc = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname, loc.hash]);

  const openMenu = React.useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMobileOpen(true);
  }, []);

  const closeMenu = React.useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMobileOpen(false);
  }, []);

  const toggleMenu = React.useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMobileOpen((v) => !v);
  }, []);

  const drawerStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 2147483646,
    display: "block",
    visibility: mobileOpen ? "visible" : "hidden",
    opacity: mobileOpen ? 1 : 0,
    pointerEvents: mobileOpen ? "auto" : "none",
  };

  const backdropStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 2147483646,
    display: "block",
    background: "rgba(0,0,0,0.65)",
    opacity: mobileOpen ? 1 : 0,
    pointerEvents: mobileOpen ? "auto" : "none",
    transition: "opacity 160ms ease",
  };

  const panelStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2147483647,
    display: "block",
    visibility: mobileOpen ? "visible" : "hidden",
    opacity: mobileOpen ? 1 : 0,
    pointerEvents: mobileOpen ? "auto" : "none",
    height: "100%",
    width: "min(340px, 90vw)",
    background: "#0b0b0b",
    borderLeft: "1px solid rgba(255,255,255,0.12)",
    padding: 14,
    overflowY: "auto",
    transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 180ms ease, opacity 160ms ease",
    color: "#fff",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.45)",
  };

  return (
    <>
      <header className="bf-appHeader">
        <div
          className="bf-appHeader-left"
          style={{
            minWidth: 0,
            flex: "1 1 auto",
            overflow: "hidden",
          }}
        >
          <Brand />
        </div>

        <div
          className="bf-appHeader-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: "0 0 auto",
            justifyContent: "flex-end",
            overflow: "visible",
          }}
        >
          <button
            className="bf-hamburger"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen ? "true" : "false"}
            aria-controls="bf-header-drawer"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={toggleMenu}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flex: "0 0 auto",
              minWidth: 96,
              height: 44,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: mobileOpen ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1,
              cursor: "pointer",
              visibility: "visible",
              opacity: 1,
              pointerEvents: "auto",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
            <span>{mobileOpen ? "Close" : "Menu"}</span>
          </button>

          {showLogout ? (
            <button
              className="bf-logout"
              type="button"
              onClick={onLogout}
              title="Logout"
              style={{ flex: "0 0 auto" }}
            >
              Logout
            </button>
          ) : null}
        </div>
      </header>

      <div
        id="bf-header-drawer"
        className="bf-drawer"
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-hidden={mobileOpen ? "false" : "true"}
      >
        <div style={backdropStyle} onClick={closeMenu} />
        <div className="bf-drawer-panel" style={panelStyle}>
          <div
            className="bf-drawer-top"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "6px 10px",
            }}
          >
            <div
              className="bf-drawer-title"
              style={{ fontWeight: 800, letterSpacing: ".3px" }}
            >
              Menu
            </div>
            <button
              className="bf-drawer-close"
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              style={{
                height: 40,
                width: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <OrgNav variant="drawer" />

          <button
            type="button"
            onClick={openMenu}
            style={{
              display: "none",
            }}
            aria-hidden="true"
            tabIndex={-1}
          >
            reopen
          </button>

          {showLogout ? (
            <button
              className="bf-drawer-logout"
              type="button"
              onClick={onLogout}
              style={{ marginTop: 14, width: "100%" }}
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
