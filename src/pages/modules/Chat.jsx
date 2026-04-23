import React, { useEffect, useState } from "react";
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

function toItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rooms)) return data.rooms;
  if (Array.isArray(data)) return data;
  return [];
}

function safeText(v) {
  return String(v ?? "");
}

export default function Chat() {
  const { orgId: orgIdParam } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [serverReady, setServerReady] = useState(true);

  async function refresh() {
    if (!orgId) return;
    setLoading(true);
    setErr("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`);
      const next = toItems(data);
      setRooms(next);
      setSelected((prev) => {
        if (!prev) return next[0] || null;
        return next.find((r) => r?.id === prev?.id) || next[0] || null;
      });
      setServerReady(true);
    } catch (e) {
      setRooms([]);
      setSelected(null);
      setServerReady(false);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [orgId]);

  if (!orgId) {
    return <div style={{ padding: 16 }}>No org selected.</div>;
  }

  return (
    <div className="card" style={{ margin: 16, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
          Chat
        </h2>
        <button className="btn" type="button" disabled title="Room creation is not wired in this scaffold pass.">
          New room
        </button>
      </div>

      <div className="helper" style={{ marginTop: 8 }}>
        Scaffold-only chat surface. Not realtime, not Matrix, not trying to become a whole other project.
      </div>

      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn" type="button" onClick={() => refresh().catch(console.error)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!serverReady ? (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 800 }}>Chat rooms API not ready</div>
          <div className="helper" style={{ marginTop: 6 }}>
            The page exists now and can be routed later without exploding into a 404-shaped disappointment.
          </div>
          {err ? (
            <div className="error" style={{ marginTop: 8 }}>
              {err}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>Rooms</div>
          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            {loading ? <div className="helper">Loading rooms...</div> : null}
            {!loading && rooms.length === 0 ? (
              <div className="helper">No rooms yet.</div>
            ) : null}
            {!loading &&
              rooms.map((room) => (
                <button
                  key={room?.id || room?.name}
                  className="btn"
                  type="button"
                  onClick={() => setSelected(room)}
                  style={{ textAlign: "left", justifyContent: "flex-start" }}
                >
                  {safeText(room?.name) || "Untitled room"}
                </button>
              ))}
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>
            {safeText(selected?.name) || "Room detail"}
          </div>
          <div className="helper" style={{ marginTop: 6 }}>
            {selected
              ? safeText(selected?.topic) || "No topic yet."
              : "Select a room once rooms exist."}
          </div>

          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 800 }}>Messages</div>
            <div className="helper" style={{ marginTop: 6 }}>
              Placeholder only. This batch is about making the page exist in the real repo so later routing and expansion have something concrete to target.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
