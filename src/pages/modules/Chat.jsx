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

function toItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rooms)) return data.rooms;
  if (Array.isArray(data)) return data;
  return [];
}

function safeText(v) {
  return String(v ?? "");
}

function getRoomKey(room, index) {
  return safeText(room?.id || room?.roomId || room?.name || `room-${index}`);
}

export default function Chat() {
  const { orgId: orgIdParam } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createValue, setCreateValue] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedKey = useMemo(() => {
    if (!selected) return "";
    return safeText(selected?.id || selected?.roomId || selected?.name);
  }, [selected]);

  async function refresh({ keepError = false } = {}) {
    if (!orgId) return;
    setLoading(true);
    if (!keepError) setError("");

    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`);
      const nextRooms = toItems(data);
      setRooms(nextRooms);
      setSelected((previous) => {
        if (!previous) return nextRooms[0] || null;
        const previousKey = safeText(previous?.id || previous?.roomId || previous?.name);
        return nextRooms.find((room) => safeText(room?.id || room?.roomId || room?.name) === previousKey) || nextRooms[0] || null;
      });
    } catch (e) {
      setRooms([]);
      setSelected(null);
      setError(e?.message || "Failed to load chat rooms.");
    } finally {
      setLoading(false);
    }
  }

  async function createRoom() {
    const name = createValue.trim();
    if (!name || !orgId) return;

    setCreating(true);
    setError("");

    try {
      await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setCreateValue("");
      await refresh();
    } catch (e) {
      setError(e?.message || "Failed to create room.");
    } finally {
      setCreating(false);
    }
  }

  function onCreateSubmit(event) {
    event.preventDefault();
    createRoom().catch(console.error);
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
      </div>

      <div className="helper" style={{ marginTop: 8 }}>
        Rooms are loaded from this org&apos;s chat rooms endpoint.
      </div>

      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn" type="button" onClick={() => refresh().catch(console.error)} disabled={loading || creating}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <form onSubmit={onCreateSubmit} className="row" style={{ gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={createValue}
          onChange={(event) => setCreateValue(event.target.value)}
          placeholder="New room name"
          aria-label="New room name"
          style={{ minWidth: 220, flex: "1 1 240px" }}
          disabled={creating || loading}
        />
        <button className="btn" type="submit" disabled={creating || loading || !createValue.trim()}>
          {creating ? "Creating..." : "Create room"}
        </button>
      </form>

      {error ? (
        <div className="error" style={{ marginTop: 10 }}>
          {error}
        </div>
      ) : null}

      <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>Rooms</div>
          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            {loading ? <div className="helper">Loading rooms...</div> : null}
            {!loading && rooms.length === 0 ? <div className="helper">No rooms yet. Create the first room above.</div> : null}
            {!loading &&
              rooms.map((room, index) => {
                const roomKey = getRoomKey(room, index);
                const roomName = safeText(room?.name) || "Untitled room";
                const isSelected = selectedKey && selectedKey === safeText(room?.id || room?.roomId || room?.name);

                return (
                  <button
                    key={roomKey}
                    className="btn"
                    type="button"
                    onClick={() => setSelected(room)}
                    style={{
                      textAlign: "left",
                      justifyContent: "flex-start",
                      borderColor: isSelected ? "var(--brand, #4f46e5)" : undefined,
                    }}
                  >
                    {roomName}
                  </button>
                );
              })}
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>{safeText(selected?.name) || "Room detail"}</div>
          <div className="helper" style={{ marginTop: 6 }}>
            {selected ? safeText(selected?.topic) || "No topic yet." : "Select a room once rooms exist."}
          </div>

          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 800 }}>Messages</div>
            <div className="helper" style={{ marginTop: 6 }}>Message UI is not part of this thread.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
