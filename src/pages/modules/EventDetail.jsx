import React, { useEffect, useState } from "react";
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

export default function EventDetail() {
  const { orgId: orgIdParam, eventId } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [serverReady, setServerReady] = useState(true);

  async function refresh() {
    if (!orgId || !eventId) return;
    setLoading(true);
    setErr("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}`);
      setItem(data?.item || data?.event || data || null);
      setServerReady(true);
    } catch (e) {
      setItem(null);
      setServerReady(false);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [orgId, eventId]);

  if (!orgId) return <div style={{ padding: 16 }}>No org selected.</div>;
  if (!eventId) return <div style={{ padding: 16 }}>No event selected.</div>;

  return (
    <div className="card" style={{ margin: 16, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
          Event Detail
        </h2>
        <Link className="btn" to={`/org/${encodeURIComponent(orgId)}/events`}>
          Back
        </Link>
      </div>

      <div className="helper" style={{ marginTop: 8 }}>
        Scaffold-level detail surface only. Enough to prove routing and give later event work somewhere to land.
      </div>

      {loading ? <div className="helper" style={{ marginTop: 12 }}>Loading event...</div> : null}

      {!serverReady ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Event detail API not ready</div>
          <div className="helper" style={{ marginTop: 6 }}>
            The page now exists in the repo. Data wiring can come later.
          </div>
          {err ? (
            <div className="error" style={{ marginTop: 8 }}>
              {err}
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && serverReady && !item ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Event not found</div>
          <div className="helper" style={{ marginTop: 6 }}>
            This may just mean the scaffold endpoint has no record yet.
          </div>
        </div>
      ) : null}

      {!loading && item ? (
        <div className="grid" style={{ gap: 10, marginTop: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>{safeText(item?.title) || "Untitled event"}</div>
            <div className="helper" style={{ marginTop: 6 }}>
              {formatWhen(item?.starts_at)}
              {item?.ends_at ? ` → ${formatWhen(item.ends_at)}` : ""}
            </div>
            <div className="helper" style={{ marginTop: 4 }}>
              {safeText(item?.location) || "Location pending"}
            </div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>Description</div>
            <div style={{ marginTop: 8 }}>
              {safeText(item?.description) || "No description yet."}
            </div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>Linked records</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Placeholder only. Tagging and linking can land after route exposure is complete.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
