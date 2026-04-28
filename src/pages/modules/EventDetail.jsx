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


function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => safeText(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return normalizeTags(parsed);
    } catch {}
    return text
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function isNotFoundError(message) {
  const text = safeText(message).toUpperCase();
  return text.includes("NOT_FOUND") || text.includes("404");
}

export default function EventDetail() {
  const { orgId: orgIdParam, eventId } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [missing, setMissing] = useState(false);

  async function refresh() {
    if (!orgId || !eventId) return;
    setLoading(true);
    setErr("");
    setMissing(false);
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}`);
      setItem(data?.item || data?.event || data || null);
    } catch (e) {
      const msg = e?.message || String(e);
      setItem(null);
      if (isNotFoundError(msg)) {
        setMissing(true);
      } else {
        setErr(msg);
      }
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
        <button className="btn" type="button" onClick={() => refresh().catch(console.error)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <Link className="btn" to={`/org/${encodeURIComponent(orgId)}/events`}>
          Back
        </Link>
      </div>

      {loading ? (
        <div className="helper" style={{ marginTop: 12 }}>
          Loading event...
        </div>
      ) : null}

      {!loading && err ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Couldn’t load event details</div>
          <div className="error" style={{ marginTop: 8 }}>
            {err}
          </div>
        </div>
      ) : null}

      {!loading && missing ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Event not found</div>
          <div className="helper" style={{ marginTop: 6 }}>
            Event ID {safeText(eventId) || "(unknown)"} does not exist in this organization.
          </div>
        </div>
      ) : null}

      {!loading && !err && !missing && !item ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Event unavailable</div>
          <div className="helper" style={{ marginTop: 6 }}>
            This event is missing data or is no longer available.
          </div>
        </div>
      ) : null}

      {!loading && !err && !missing && item ? (
        <div className="grid" style={{ gap: 10, marginTop: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>{safeText(item?.title) || "Untitled event"}</div>
            <div className="helper" style={{ marginTop: 6 }}>
              {formatWhen(item?.starts_at)}
              {item?.ends_at ? ` → ${formatWhen(item.ends_at)}` : ""}
            </div>
            <div className="helper" style={{ marginTop: 4 }}>{safeText(item?.location) || "Location pending"}</div>
            {normalizeTags(item?.tags ?? item?.tags_json).length ? (
              <div className="helper" style={{ marginTop: 4 }}>
                Tags: {normalizeTags(item?.tags ?? item?.tags_json).join(", ")}
              </div>
            ) : null}
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800 }}>Description</div>
            <div style={{ marginTop: 8 }}>{safeText(item?.description) || "No description yet."}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
