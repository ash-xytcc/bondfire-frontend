import React from "react";
import { useParams } from "react-router-dom";
import { createBondfireColophonAdapter } from "./bondfireAdapter.js";
import { createColophonHostContext } from "./hostContract.js";

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

  if (state.loading) {
    return <main className="page"><p className="helper">Opening publishing workspace…</p></main>;
  }

  if (state.error || !state.session) {
    return (
      <main className="page">
        <div className="card" style={{ padding: 20 }}>
          <h1>Colophon</h1>
          <p className="helper">{state.error || "Publishing workspace unavailable."}</p>
        </div>
      </main>
    );
  }

  const host = createColophonHostContext({
    orgId,
    role: state.session.role,
    user: state.session.user,
  });
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

  return (
    <Workspace
      host={host}
      adapter={adapter}
      session={state.session}
      orgId={orgId}
      embedded
    />
  );
}
