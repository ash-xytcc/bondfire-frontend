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

function ensureHostFetchBridge(apiBase) {
  activeApiBase = String(apiBase || "").replace(/\/+$/, "");
  if (originalFetch || typeof window === "undefined" || typeof window.fetch !== "function") return;

  originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (!activeApiBase) return originalFetch(input, init);

    const raw = input instanceof Request ? input.url : String(input || "");
    const url = new URL(raw, window.location.origin);
    const sameOrigin = url.origin === window.location.origin;
    const isBondfireOwned =
      url.pathname.startsWith("/api/orgs/") ||
      url.pathname.startsWith("/api/auth/") ||
      url.pathname.startsWith("/api/support/");

    if (!sameOrigin || !url.pathname.startsWith("/api/") || isBondfireOwned) {
      return originalFetch(input, init);
    }

    const suffix = url.pathname.replace(/^\/api\/?/, "");
    url.pathname = `${activeApiBase}/${suffix}`.replace(/\/{2,}/g, "/");

    if (input instanceof Request) {
      return originalFetch(new Request(url.toString(), input), init);
    }
    return originalFetch(url.toString(), init);
  };
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
    return () => {
      activeApiBase = "";
    };
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
    <>
      <ColophonNativeStyles />
      <RouteContext.Provider value={EMPTY_COLOPHON_ROUTE_CONTEXT}>
        <Workspace
          host={host}
          adapter={adapter}
          session={state.session}
          orgId={orgId}
          embedded
        />
      </RouteContext.Provider>
    </>
  );
}
