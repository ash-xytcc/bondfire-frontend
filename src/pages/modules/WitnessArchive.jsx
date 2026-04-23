import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api.js";

function getOrgIdFromHash() {
  try {
    const m = (window.location.hash || "").match(/#\/org\/([^/]+)/);
    return m && m[1] ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function safeText(v) {
  return String(v ?? "");
}

function toItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data)) return data;
  return [];
}

function formatWhen(value) {
  if (value == null || value === "") return "Date unknown";
  const n = Number(value);
  const d = Number.isFinite(n) ? new Date(n) : new Date(value);
  if (Number.isNaN(d.getTime())) return "Date unknown";
  return d.toLocaleString();
}

export default function WitnessArchive() {
  const { orgId: orgIdParam } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [serverReady, setServerReady] = useState(true);

  async function refresh() {
    if (!orgId) return;
    setLoading(true);
    setErr("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/witness`);
      setItems(toItems(data));
      setServerReady(true);
    } catch (e) {
      setItems([]);
      setServerReady(false);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [orgId]);

  const filtered = useMemo(() => {
    const needle = safeText(q).trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [safeText(item?.title), safeText(item?.summary), safeText(item?.visibility)]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [items, q]);

  if (!orgId) {
    return <div style={{ padding: 16 }}>No org selected.</div>;
  }

  return (
    <div className="card" style={{ margin: 16, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
          Witness Archive
        </h2>
        <button className="btn" type="button" disabled title="Create flow is not wired in this scaffold pass.">
          New record
        </button>
      </div>

      <div className="helper" style={{ marginTop: 8 }}>
        Private metadata-first archive scaffold. The point right now is to make the page real in-repo, not to pretend it is finished.
      </div>

      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search witness records"
          style={{ minWidth: 240, flex: 1 }}
        />
        <button className="btn" type="button" onClick={() => refresh().catch(console.error)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!serverReady ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Witness API not ready</div>
          <div className="helper" style={{ marginTop: 6 }}>
            The page exists now, which is the actual blocker you asked me to fix.
          </div>
          {err ? (
            <div className="error" style={{ marginTop: 8 }}>
              {err}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid" style={{ gap: 10, marginTop: 12 }}>
        {loading ? <div className="helper">Loading witness records...</div> : null}

        {!loading && filtered.length === 0 ? (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>No witness records yet</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Later batches can add create and edit flows once routes and server pieces are in place.
            </div>
          </div>
        ) : null}

        {!loading &&
          filtered.map((item) => (
            <div key={item?.id || `${item?.title || "record"}-${item?.happened_at || Math.random()}`} className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800 }}>{safeText(item?.title) || "Untitled record"}</div>
              <div className="helper" style={{ marginTop: 6 }}>
                {formatWhen(item?.happened_at)}
                {item?.visibility ? ` • ${safeText(item.visibility)}` : ""}
              </div>
              <div style={{ marginTop: 8 }}>
                {safeText(item?.summary) || "No summary yet."}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
