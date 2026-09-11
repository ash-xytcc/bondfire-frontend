import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isDemoMode } from "../demo/demoMode.js";
import {
  getAvailablePlatformModules,
  getDefaultEnabledModuleIds,
  getPlatformModules,
  getStarterPacks,
  normalizeSelectedModuleIds,
} from "../platform/moduleRegistry.js";
import {
  clearPendingBuild,
  readPendingBuild,
  writePendingBuild,
} from "../platform/pendingBuild.js";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function modulePath(orgId) {
  return "/api/orgs/" + encodeURIComponent(orgId) + "/modules";
}

async function requestModuleConfig(orgId, options = {}) {
  const path = modulePath(orgId);
  const urls = API_BASE ? [API_BASE + path, path] : [path];
  let lastError = null;

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        body:
          options.body && typeof options.body !== "string"
            ? JSON.stringify(options.body)
            : options.body,
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload?.ok !== false) return payload;
      lastError = new Error(payload?.error || "Module configuration request failed");
      const canFallback =
        index === 0 &&
        urls.length > 1 &&
        (response.status === 404 || response.status === 500);
      if (!canFallback) break;
    } catch (error) {
      lastError = error;
      if (index === urls.length - 1) break;
    }
  }

  throw lastError || new Error("Module configuration request failed");
}

function sameIds(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function BuildModules() {
  const { orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isStandalone = !orgId;
  const isOnboarding =
    new URLSearchParams(location.search || "").get("first") === "1";
  const liveModules = React.useMemo(() => getAvailablePlatformModules(), []);
  const onDeckModules = React.useMemo(
    () => getPlatformModules().filter((moduleDef) => !moduleDef.available),
    []
  );
  const starterPacks = React.useMemo(() => getStarterPacks(), []);
  const defaults = React.useMemo(() => getDefaultEnabledModuleIds(), []);

  const initialIds = React.useMemo(() => {
    const pending = readPendingBuild();
    return normalizeSelectedModuleIds(pending.length ? pending : defaults);
  }, [defaults]);

  const [selected, setSelected] = React.useState(() => new Set(initialIds));
  const [savedIds, setSavedIds] = React.useState(() => initialIds);
  const [canEdit, setCanEdit] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");

  const selectedIds = React.useMemo(
    () => normalizeSelectedModuleIds([...selected]),
    [selected]
  );
  const selectedVisibleIds = React.useMemo(() => {
    const visible = new Set(liveModules.map((moduleDef) => moduleDef.id));
    return selectedIds.filter((id) => visible.has(id));
  }, [liveModules, selectedIds]);
  const dirty = !sameIds(selectedIds, savedIds);
  const filterText = query.trim().toLowerCase();
  const visibleModules = liveModules.filter((moduleDef) => {
    if (!filterText) return true;
    return [moduleDef.label, moduleDef.name, moduleDef.description]
      .join(" ")
      .toLowerCase()
      .includes(filterText);
  });

  const loadConfig = React.useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    if (!orgId) {
      const pending = readPendingBuild();
      const nextIds = normalizeSelectedModuleIds(
        pending.length ? pending : defaults
      );
      setSelected(new Set(nextIds));
      setSavedIds(nextIds);
      setCanEdit(true);
      setLoading(false);
      return;
    }

    if (isDemoMode()) {
      setSelected(new Set(defaults));
      setSavedIds(defaults);
      setCanEdit(true);
      setLoading(false);
      return;
    }

    try {
      if (isOnboarding) {
        const pending = readPendingBuild();
        if (pending.length) {
          const nextIds = normalizeSelectedModuleIds(pending);
          setSelected(new Set(nextIds));
          setSavedIds(nextIds);
          setCanEdit(true);
          setLoading(false);
          return;
        }
      }

      const payload = await requestModuleConfig(orgId, { method: "GET" });
      const nextIds = normalizeSelectedModuleIds(
        payload?.enabled_modules || defaults
      );
      setSelected(new Set(nextIds));
      setSavedIds(nextIds);
      setCanEdit(payload?.can_edit !== false);
    } catch (loadError) {
      if (isOnboarding) {
        const pending = readPendingBuild();
        if (pending.length) {
          const nextIds = normalizeSelectedModuleIds(pending);
          setSelected(new Set(nextIds));
          setSavedIds(nextIds);
          setCanEdit(true);
          setLoading(false);
          return;
        }
      }
      setSelected(new Set(defaults));
      setSavedIds(defaults);
      setCanEdit(false);
      setError(loadError?.message || "Could not load this Bondfire build.");
    } finally {
      setLoading(false);
    }
  }, [defaults, isOnboarding, orgId]);

  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const toggleModule = (moduleId) => {
    if (!canEdit) return;
    setNotice("");
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const choosePack = (pack) => {
    if (!canEdit) return;
    setNotice("");
    setSelected(new Set(normalizeSelectedModuleIds(pack.modules)));
  };

  const saveBuild = async () => {
    if (!canEdit || busy || loading) return;
    if (orgId && !dirty && !isOnboarding) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (!orgId) {
        writePendingBuild(selectedIds);
        setSavedIds(selectedIds);
        navigate("/signin?mode=register&from=builder");
        return;
      }

      await requestModuleConfig(orgId, {
        method: "PUT",
        body: { enabled_modules: selectedIds },
      });
      clearPendingBuild();
      setSavedIds(selectedIds);

      if (isOnboarding) {
        navigate("/org/" + encodeURIComponent(orgId) + "/overview", {
          replace: true,
        });
        return;
      }

      setNotice("Build saved.");
      window.dispatchEvent(
        new CustomEvent("bf:modules_changed", {
          detail: { orgId, enabled_modules: selectedIds },
        })
      );
    } catch (saveError) {
      setError(saveError?.message || "Could not save this build.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bf-build-page">
      <header className="bf-build-hero">
        <div>
          <p className="bf-build-eyebrow">BONDFIRE // V3</p>
          <h1>Build the space around the work.</h1>
          <p className="bf-build-lede">
            {isStandalone
              ? "Choose what your group needs. When you build, Bondfire will ask for the account that owns this space."
              : "Start with the core. Keep the pieces that serve the group. Add more when the work asks for it."}
          </p>
        </div>
        <div className="bf-build-counter" aria-live="polite">
          <span>LIVE MODULES</span>
          <strong>{selectedVisibleIds.length}</strong>
          <small>
            {loading
              ? "syncing"
              : dirty
                ? "changes staged"
                : "in this build"}
          </small>
        </div>
      </header>

      <div className="bf-build-layout">
        <aside className="bf-build-rail">
          <div className="bf-build-rail-brand">
            <span className="bf-build-mark">BF</span>
            <span>Bondfire</span>
          </div>
          <div className="bf-build-rule" />
          <p className="bf-build-label">THE CORE</p>
          <h2>One room.<br />Many ways to move.</h2>
          <p className="bf-build-rail-copy">
            The core stays present: dashboard, settings, security, and the build room. Everything else is yours to shape.
          </p>
          <ul className="bf-build-core-list">
            <li><span>01</span>Overview</li>
            <li><span>02</span>Settings</li>
            <li><span>03</span>Emergency</li>
            <li><span>04</span>Build</li>
          </ul>
          <div className="bf-build-rail-bottom">
            <div className="bf-build-selection-line">
              <span>Selected</span>
              <strong>{selectedVisibleIds.length} / {liveModules.length}</strong>
            </div>
            <button
              className="bf-build-action"
              type="button"
              onClick={saveBuild}
              disabled={
                !canEdit ||
                loading ||
                busy ||
                (Boolean(orgId) && !dirty && !isOnboarding)
              }
            >
              {busy
                ? "Building…"
                : isStandalone
                  ? "Build & continue"
                  : dirty || isOnboarding
                    ? "Build this Bondfire"
                    : "Build is current"}
            </button>
            {!canEdit && !loading ? (
              <p className="bf-build-permission">
                Admin or owner access is needed to change the build.
              </p>
            ) : null}
            {error ? (
              <p className="bf-build-message is-error">{error}</p>
            ) : null}
            {notice ? <p className="bf-build-message">{notice}</p> : null}
          </div>
        </aside>

        <main className="bf-build-main">
          <div className="bf-build-toolbar">
            <div>
              <p className="bf-build-label">LIVE MODULES</p>
              <h2>Choose what belongs in the room.</h2>
            </div>
            <label className="bf-build-search">
              <span className="sr-only">Filter modules</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter modules"
              />
            </label>
          </div>

          <div className="bf-build-packs" aria-label="Starter builds">
            <span className="bf-build-pack-label">START WITH</span>
            {starterPacks.map((pack) => (
              <button
                key={pack.id}
                className="bf-build-pack"
                type="button"
                onClick={() => choosePack(pack)}
                disabled={!canEdit || loading}
                title={pack.description}
              >
                {pack.label}
              </button>
            ))}
          </div>

          <div className="bf-build-grid">
            {visibleModules.map((moduleDef) => {
              const isSelected = selected.has(moduleDef.id);
              return (
                <article
                  className={
                    "bf-build-module-card" + (isSelected ? " is-selected" : "")
                  }
                  key={moduleDef.id}
                >
                  <div className="bf-build-module-meta">
                    <span className="bf-build-module-mark">{moduleDef.mark}</span>
                    <span className="bf-build-module-state">
                      {isSelected ? "ADDED" : "AVAILABLE"}
                    </span>
                  </div>
                  <h3>{moduleDef.label}</h3>
                  <p>{moduleDef.description}</p>
                  <div className="bf-build-module-footer">
                    <span className="bf-build-route">/{moduleDef.routeBase}</span>
                    <button
                      className="bf-build-toggle"
                      type="button"
                      onClick={() => toggleModule(moduleDef.id)}
                      disabled={!canEdit || loading}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? "Remove" : "Add"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!visibleModules.length ? (
            <p className="bf-build-empty">Nothing matched that filter.</p>
          ) : null}

          <section className="bf-build-on-deck">
            <div className="bf-build-on-deck-heading">
              <div>
                <p className="bf-build-label">ON DECK</p>
                <h2>Still becoming.</h2>
              </div>
              <span>Not in the initial ship</span>
            </div>
            <div className="bf-build-on-deck-grid">
              {onDeckModules.map((moduleDef) => (
                <article className="bf-build-future-card" key={moduleDef.id}>
                  <div className="bf-build-module-meta">
                    <span className="bf-build-module-mark">{moduleDef.mark}</span>
                    <span className="bf-build-module-state">
                      COMING SOON
                    </span>
                  </div>
                  <h3>{moduleDef.label}</h3>
                  <p>{moduleDef.description}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
