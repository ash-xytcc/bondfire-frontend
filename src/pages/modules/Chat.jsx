import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api.js";
import { decryptWithOrgKey, encryptWithOrgKey, getCachedOrgKey } from "../../lib/zk.js";

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
function toMessages(data) {
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}
function safeText(v) { return String(v ?? ""); }
function getRoomIdentity(room) { return safeText(room?.id || room?.roomId || room?.name); }
function getRoomKey(room, index) { return getRoomIdentity(room) || `room-${index}`; }
function getMessageKey(message, index) { return safeText(message?.id || message?.messageId) || `message-${index}`; }

async function decryptEnvelope(key, blob, fallback = {}) {
  if (!key || !blob) return fallback;
  try {
    const value = JSON.parse(await decryptWithOrgKey(key, blob));
    return value && typeof value === "object" ? value : fallback;
  } catch {
    return fallback;
  }
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
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [draft, setDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const selectedKey = useMemo(() => selected ? getRoomIdentity(selected) : "", [selected]);

  async function decodeRooms(raw, key) {
    const out = [];
    for (const room of raw) {
      if (room?.encrypted_blob) {
        const dec = await decryptEnvelope(key, room.encrypted_blob, {});
        out.push({ ...room, name: dec.name || "(encrypted)" });
        continue;
      }
      if (key && room?.id && room?.name) {
        const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ name: safeText(room.name) }));
        await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, {
          method: "PUT",
          body: JSON.stringify({ id: room.id, encrypted_blob }),
        });
        out.push({ ...room, encrypted_blob });
        continue;
      }
      out.push(room);
    }
    return out;
  }

  async function refreshRooms({ clearError = true } = {}) {
    if (!orgId) return;
    setLoadingRooms(true);
    if (clearError) setRoomsError("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`);
      const raw = toItems(data).filter((room) => room && typeof room === "object");
      const key = getCachedOrgKey(orgId);
      const nextRooms = await decodeRooms(raw, key);
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

  async function decodeMessages(raw, roomId, key) {
    const out = [];
    for (const message of raw) {
      if (message?.encrypted_blob) {
        const dec = await decryptEnvelope(key, message.encrypted_blob, {});
        out.push({ ...message, body: dec.body || "(encrypted)", authorLabel: dec.authorLabel || "" });
        continue;
      }
      if (key && message?.id && message?.body) {
        const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ body: safeText(message.body), authorLabel: safeText(message.authorLabel) }));
        await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages`, {
          method: "PUT",
          body: JSON.stringify({ id: message.id, roomId, encrypted_blob }),
        });
        out.push({ ...message, encrypted_blob });
        continue;
      }
      out.push(message);
    }
    return out;
  }

  async function refreshMessages(room) {
    if (!orgId || !room) { setMessages([]); setMessagesError(""); return; }
    const roomId = getRoomIdentity(room);
    if (!roomId) { setMessages([]); setMessagesError(""); return; }
    setLoadingMessages(true);
    setMessagesError("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages?roomId=${encodeURIComponent(roomId)}`);
      const raw = toMessages(data).filter((message) => message && typeof message === "object");
      const key = getCachedOrgKey(orgId);
      setMessages(await decodeMessages(raw, roomId, key));
    } catch (e) {
      setMessages([]);
      setMessagesError(e?.message || "Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function createRoom() {
    const name = createValue.trim();
    if (!name || !orgId) return;
    const key = getCachedOrgKey(orgId);
    if (!key) { setCreateError("This device does not have the organization encryption key loaded."); return; }
    setCreatingRoom(true);
    setCreateError("");
    try {
      const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ name }));
      const response = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, {
        method: "POST",
        body: JSON.stringify({ encrypted_blob }),
      });
      setCreateValue("");
      await refreshRooms();
      if (response?.room) setSelected({ ...response.room, name });
    } catch (e) {
      setCreateError(e?.message || "Failed to create room.");
    } finally {
      setCreatingRoom(false);
    }
  }

  async function sendMessage() {
    const body = draft.trim();
    const roomId = selectedKey;
    if (!orgId || !roomId || !body) return;
    const key = getCachedOrgKey(orgId);
    if (!key) { setMessagesError("This device does not have the organization encryption key loaded."); return; }
    setSendingMessage(true);
    setMessagesError("");
    try {
      const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ body, authorLabel: "" }));
      await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages`, {
        method: "POST",
        body: JSON.stringify({ roomId, encrypted_blob }),
      });
      setDraft("");
      await refreshMessages(selected);
    } catch (e) {
      setMessagesError(e?.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  }

  function onCreateSubmit(event) { event.preventDefault(); createRoom().catch(console.error); }
  function onSendSubmit(event) { event.preventDefault(); sendMessage().catch(console.error); }
  useEffect(() => { refreshRooms().catch(console.error); }, [orgId]);
  useEffect(() => { refreshMessages(selected).catch(console.error); }, [orgId, selectedKey]);

  if (!orgId) return <div style={{ padding: 16 }}>No org selected.</div>;

  return (
    <div className="card" style={{ margin: 16, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ margin: 0, flex: 1 }}>Chat</h2>
      </div>
      <div className="helper" style={{ marginTop: 8 }}>Rooms and messages are encrypted with the organization key before they leave this device.</div>
      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn" type="button" onClick={() => refreshRooms().catch(console.error)} disabled={loadingRooms || creatingRoom}>{loadingRooms ? "Refreshing..." : "Refresh"}</button>
      </div>
      <form onSubmit={onCreateSubmit} className="row" style={{ gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input value={createValue} onChange={(event) => setCreateValue(event.target.value)} placeholder="New room name" aria-label="New room name" style={{ minWidth: 220, flex: "1 1 240px" }} disabled={creatingRoom || loadingRooms} />
        <button className="btn" type="submit" disabled={creatingRoom || loadingRooms || !createValue.trim()}>{creatingRoom ? "Creating..." : "Create room"}</button>
      </form>
      {roomsError ? <div className="error" style={{ marginTop: 10 }}>{roomsError}</div> : null}
      {createError ? <div className="error" style={{ marginTop: 10 }}>{createError}</div> : null}
      <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>Rooms</div>
          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            {loadingRooms ? <div className="helper">Loading rooms...</div> : null}
            {!loadingRooms && rooms.length === 0 ? <div className="helper">No rooms yet. Create the first room above.</div> : null}
            {!loadingRooms && rooms.map((room, index) => {
              const roomKey = getRoomKey(room, index);
              const roomName = safeText(room?.name) || "Untitled room";
              const isSelected = selectedKey && selectedKey === getRoomIdentity(room);
              return <button key={roomKey} className="btn" type="button" onClick={() => setSelected(room)} style={{ textAlign: "left", justifyContent: "flex-start", borderColor: isSelected ? "var(--brand, #4f46e5)" : undefined }}>{roomName}</button>;
            })}
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>{safeText(selected?.name) || "Room detail"}</div>
          <div className="helper" style={{ marginTop: 6 }}>{selected ? safeText(selected?.topic) || "No topic yet." : "Select a room once rooms exist."}</div>
          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 800 }}>Messages</div>
            {messagesError ? <div className="error" style={{ marginTop: 8 }}>{messagesError}</div> : null}
            {loadingMessages ? <div className="helper" style={{ marginTop: 8 }}>Loading messages...</div> : null}
            {!loadingMessages && selected && messages.length === 0 ? <div className="helper" style={{ marginTop: 8 }}>No messages yet.</div> : null}
            {!loadingMessages && !selected ? <div className="helper" style={{ marginTop: 8 }}>Select a room to view messages.</div> : null}
            {!loadingMessages && messages.length > 0 ? (
              <div className="grid" style={{ gap: 8, marginTop: 10 }}>
                {messages.map((message, index) => <div key={getMessageKey(message, index)} className="card" style={{ padding: 10 }}><div style={{ fontWeight: 700 }}>{safeText(message?.authorLabel) || "Member"}</div><div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{safeText(message?.body)}</div></div>)}
              </div>
            ) : null}
            <form onSubmit={onSendSubmit} className="row" style={{ gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={selected ? "Type a message" : "Select a room first"} aria-label="Message draft" style={{ minWidth: 220, flex: "1 1 240px" }} disabled={!selected || sendingMessage || loadingMessages} />
              <button className="btn" type="submit" disabled={!selected || sendingMessage || loadingMessages || !draft.trim()}>{sendingMessage ? "Sending..." : "Send"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
