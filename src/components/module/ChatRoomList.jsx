import React from "react";

export default function ChatRoomList({ rooms, activeRoomId, loading, onSelect, onCreateRoom, onSaveTopic }) {
  const [name, setName] = React.useState("");

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Rooms</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          className="input"
          value={name}
          placeholder="New room name"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn"
          type="button"
          onClick={() => {
            const trimmed = name.trim();
            if (!trimmed) return;
            onCreateRoom?.(trimmed);
            setName("");
          }}
        >
          Create
        </button>
      </div>

      {loading ? <div className="helper">Loading rooms…</div> : null}
      {!loading && !rooms.length ? <div className="helper">No rooms yet.</div> : null}

      <div className="grid" style={{ gap: 8 }}>
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className="btn"
            style={{
              textAlign: "left",
              borderColor: room.id === activeRoomId ? "var(--accent, #4b7)" : undefined,
            }}
            onClick={() => onSelect?.(room)}
          >
            <div style={{ fontWeight: 700 }}>{room.name || "Untitled room"}</div>
            <div className="helper" style={{ whiteSpace: "normal" }}>{room.topic || "No topic"}</div>
          </button>
        ))}
      </div>

      {activeRoomId ? (
        <div style={{ marginTop: 12 }}>
          <div className="helper">Edit selected room topic</div>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Room topic"
            defaultValue={rooms.find((r) => r.id === activeRoomId)?.topic || ""}
            onBlur={(e) => onSaveTopic?.(activeRoomId, e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
