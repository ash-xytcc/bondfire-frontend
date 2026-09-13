import React from "react";
import { UNSAFE_RouteContext as RouteContext, useParams } from "react-router-dom";
import colophonNativeStyles from "./colophon-native.css?inline";
import { createBondfireColophonAdapter } from "./bondfireAdapter.js";
import { createColophonHostContext } from "./hostContract.js";

let originalFetch = null;
let activeApiBase = "";

const EMPTY_COLOPHON_ROUTE_CONTEXT = Object.freeze({
  outlet: null,
  matches: [],
  isDataRoute: false,
});

function ColophonNativeStyles() {
  React.useLayoutEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-bondfire-colophon-native-styles", "true");
    style.textContent = colophonNativeStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return null;
}

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const safe = name.replace(/[$()*+.?[\\\\\\]^{|}]/g, "\\\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function addCsrfHeader(input, init) {
  const method = String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return { input, init };

  const token = readCookie("bf_csrf");
  if (!token) return { input, init };

  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  if (!headers.has("X-CSRF")) headers.set("X-CSRF", token);

  if (input instanceof Request) {
    return { input: new Request(input, { headers }), init };
  }
  return { input, init: { ...init, headers } };
}

function ensureHostFetchBridge(apiBase) {
  activeApiBase = String(apiBase || "").replace(/\\/+$/, "");
  if (originalFetch || typeof window === "undefined" || typeof window.fetch !== "function") return;

  originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (!activeApiBase) {
      const request = addCsrfHeader(input, init);
      return originalFetch(request.input, request.init);
    }

    const raw = input instanceof Request ? input.url : String(input || "");
    const url = new URL(raw, window.location.origin);
    const sameOrigin = url.origin === window.location.origin;
    const isBondfireOwned =
      url.pathname.startsWith("/api/orgs/") ||
      url.pathname.startsWith("/api/auth/") ||
      url.pathname.startsWith("/api/support/");

    if (!sameOrigin || !url.pathname.startsWith("/api/") || isBondfireOwned) {
      const request = addCsrfHeader(input, init);
      return originalFetch(request.input, request.init);
    }

    const suffix = url.pathname.replace(/^\\/api\\/?/, "");
    url.pathname = `${activeApiBase}/${suffix}`.replace(/\\/{2,}/g, "/");

    const request = addCsrfHeader(
      input instanceof Request ? new Request(url.toString(), input) : url.toString(),
      init,
    );
    return originalFetch(request.input, request.init);
  };
}

function ColophonPublicLinkGuard({ routeBase }) {
  React.useEffect(() => {
    const base = String(routeBase || "").replace(/\\/+$/, "");
    if (!base) return undefined;

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url;
      try { url = new URL(anchor.href, window.location.origin); } catch { return; }
      if (url.origin !== window.location.origin) return;

      const publicPath = /^\\/(?:post|piece|project|projects|archive|search|publications|reader|campaigns|collections|press|about|security|contact|submit|support|updates)(?:\\/|$)/.test(url.pathname) || url.pathname === "/";
      if (!publicPath || url.pathname.startsWith(base)) return;

      event.preventDefault();
      window.history.pushState({}, "", `${base}${url.pathname === "/" ? "/" : url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [routeBase]);

  return null;
}

export default function ColophonNativeModule({ Workspace }) {
  const { orgId } = useParams();
  const [state, setState] = React.useState({ loading: true, session: null, error: "" });

  React.useEffect(() => {
    let alive = true;
    const encodedOrgId = encodeURIComponent(String(orgId || ""));

    async function load() {
      try {
        const response = await fetch(`/api/orgs/${encodedOrgId}/colophon/session`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const session = await response.json().catch(() => null);
        if (!response.ok || !session?.authenticated) {
          throw new Error(session?.error || "Unable to open the Colophon workspace.");
        }
        if (alive) setState({ loading: false, session, error: "" });
      } catch (error) {
        if (alive) setState({ loading: false, session: null, error: String(error?.message || error) });
      }
    }

    load();
    return () => { alive = false; };
  }, [orgId]);

  const host = React.useMemo(() => {
    if (!state.session) return null;
    return createColophonHostContext({
      orgId,
      role: state.session.role,
      user: state.session.user,
    });
  }, [orgId, state.session]);

  React.useEffect(() => {
    if (!host?.apiBase) return undefined;
    ensureHostFetchBridge(host.apiBase);
    return () => { activeApiBase = ""; };
  }, [host?.apiBase]);

  if (state.loading) {
    return <main className="page"><p className="helper">Opening publishing workspace…</p></main>;
  }

  if (state.error || !state.session || !host) {
    return (
      <main className="page">
        <div className="card" style={{ padding: 20 }}>
          <h1>Colophon</h1>
          <p className="helper">{state.error || "Publishing workspace unavailable."}</p>
        </div>
      </main>
    );
  }

  const adapter = createBondfireColophonAdapter(host);

  if (!Workspace) {
    return (
      <main className="page">
        <div className="card" style={{ padding: 20 }}>
          <h1>Colophon</h1>
          <p className="helper">The native Colophon workspace export is not available in this build.</p>
        </div>
      </main>
    );
  }

  ensureHostFetchBridge(host.apiBase);

  return (
    <div className="bondfire-colophon-native-shell">
      <ColophonNativeStyles />
      <ColophonPublicLinkGuard routeBase={host.routeBase} />
      <RouteContext.Provider value={EMPTY_COLOPHON_ROUTE_CONTEXT}>
        <Workspace
          host={host}
          adapter={adapter}
          session={state.session}
          orgId={orgId}
          embedded
        />
      </RouteContext.Provider>
    </div>
  );
}
