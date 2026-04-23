import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../utils/api.js";

function getOrgIdFromHash() {
  try {
    const m = (window.location.hash || "").match(/#\/org\/([^/]+)/);
    return m && m[1] ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function toItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data)) return data;
  return [];
}

function safeText(v) {
  return String(v ?? "");
}

function formatWhen(value) {
  if (value == null || value === "") return "Date pending";
  const n = Number(value);
  const d = Number.isFinite(n) ? new Date(n) : new Date(value);
  if (Number.isNaN(d.getTime())) return "Date pending";
  return d.toLocaleString();
}

export default function Events() {
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
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/events`);
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
      [
        safeText(item?.title),
        safeText(item?.description),
        safeText(item?.location),
      ]
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
          Events
        </h2>
        <button className="btn" type="button" disabled title="Create flow is not wired in this scaffold pass.">
          New event
        </button>
      </div>

      <div className="helper" style={{ marginTop: 8 }}>
        Thread 4 scaffold page only. This gives routing a real destination and a safe empty state instead of a blank void.
      </div>

      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events"
          style={{ minWidth: 240, flex: 1 }}
        />
        <button className="btn" type="button" onClick={() => refresh().catch(console.error)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!serverReady ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Events API not ready</div>
          <div className="helper" style={{ marginTop: 6 }}>
            The page exists in-repo now. Backend wiring can land separately.
          </div>
          {err ? (
            <div className="error" style={{ marginTop: 8 }}>
              {err}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid" style={{ gap: 10, marginTop: 12 }}>
        {loading ? <div className="helper">Loading events...</div> : null}

        {!loading && filtered.length === 0 ? (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>No events yet</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Once routing is wired, this page is ready to receive scaffold-level event records.
            </div>
          </div>
        ) : null}

        {!loading &&
          filtered.map((item) => {
            const id = item?.id || item?.event_id || "";
            const href = id ? `/org/${encodeURIComponent(orgId)}/events/${encodeURIComponent(id)}` : "#";
            return (
              <div key={id || `${item?.title || "event"}-${item?.starts_at || Math.random()}`} className="card" style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800, flex: 1 }}>{safeText(item?.title) || "Untitled event"}</div>
                  {id ? (
                    <Link className="btn" to={href}>
                      Open
                    </Link>
                  ) : (
                    <button className="btn" type="button" disabled>
                      Open
                    </button>
                  )}
                </div>
                <div className="helper" style={{ marginTop: 6 }}>
                  {formatWhen(item?.starts_at)}
                  {item?.location ? ` • ${safeText(item.location)}` : ""}
                </div>
                {item?.description ? (
                  <div style={{ marginTop: 8 }}>{safeText(item.description)}</div>
                ) : null}
              </div>
            );
          })}
      </div>
    </div>
  );
}
