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

function getRoomIdentity(room) {
  return safeText(room?.id || room?.roomId || room?.name);
}

function getRoomKey(room, index) {
  return getRoomIdentity(room) || `room-${index}`;
}

export default function Chat() {
  const { orgId: orgIdParam } = useParams();
  const orgId = orgIdParam || getOrgIdFromHash();

  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [createValue, setCreateValue] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [createError, setCreateError] = useState("");

  const selectedKey = useMemo(() => {
    if (!selected) return "";
    return getRoomIdentity(selected);
  }, [selected]);

  async function refreshRooms({ clearError = true } = {}) {
    if (!orgId) return;
    setLoadingRooms(true);
    if (clearError) setRoomsError("");

    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`);
      const nextRooms = toItems(data).filter((room) => room && typeof room === "object");

      setRooms(nextRooms);
      setSelected((previous) => {
        if (!previous) return nextRooms[0] || null;

        const previousKey = getRoomIdentity(previous);
        return nextRooms.find((room) => getRoomIdentity(room) === previousKey) || nextRooms[0] || null;
      });
    } catch (e) {
      setRooms([]);
      setSelected(null);
      setRoomsError(e?.message || "Failed to load chat rooms.");
    } finally {
      setLoadingRooms(false);
    }
  }

  async function createRoom() {
    const name = createValue.trim();
    if (!name || !orgId) return;

    setCreatingRoom(true);
    setCreateError("");

    try {
      const response = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      setCreateValue("");
      await refreshRooms();

      if (response?.room) {
        setSelected(response.room);
      }
    } catch (e) {
      setCreateError(e?.message || "Failed to create room.");
    } finally {
      setCreatingRoom(false);
    }
  }

  function onCreateSubmit(event) {
    event.preventDefault();
    createRoom().catch(console.error);
  }

  useEffect(() => {
    refreshRooms().catch(console.error);
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
        <button className="btn" type="button" onClick={() => refreshRooms().catch(console.error)} disabled={loadingRooms || creatingRoom}>
          {loadingRooms ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <form onSubmit={onCreateSubmit} className="row" style={{ gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={createValue}
          onChange={(event) => setCreateValue(event.target.value)}
          placeholder="New room name"
          aria-label="New room name"
          style={{ minWidth: 220, flex: "1 1 240px" }}
          disabled={creatingRoom || loadingRooms}
        />
        <button className="btn" type="submit" disabled={creatingRoom || loadingRooms || !createValue.trim()}>
          {creatingRoom ? "Creating..." : "Create room"}
        </button>
      </form>

      {roomsError ? (
        <div className="error" style={{ marginTop: 10 }}>
          {roomsError}
        </div>
      ) : null}

      {createError ? (
        <div className="error" style={{ marginTop: 10 }}>
          {createError}
        </div>
      ) : null}

      <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>Rooms</div>
          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            {loadingRooms ? <div className="helper">Loading rooms...</div> : null}
            {!loadingRooms && rooms.length === 0 ? <div className="helper">No rooms yet. Create the first room above.</div> : null}
            {!loadingRooms &&
              rooms.map((room, index) => {
                const roomKey = getRoomKey(room, index);
                const roomName = safeText(room?.name) || "Untitled room";
                const isSelected = selectedKey && selectedKey === getRoomIdentity(room);

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
