import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api.js";
import { decryptWithOrgKey, encryptWithOrgKey, getCachedOrgKey } from "../../lib/zk.js";

function getOrgIdFromHash() {
  try { const m = (window.location.hash || "").match(/#\/org\/([^/]+)/); return m && m[1] ? decodeURIComponent(m[1]) : null; } catch { return null; }
}
function toItems(data) { if (Array.isArray(data?.items)) return data.items; if (Array.isArray(data?.rooms)) return data.rooms; if (Array.isArray(data)) return data; return []; }
function toMessages(data) { if (Array.isArray(data?.messages)) return data.messages; if (Array.isArray(data?.items)) return data.items; if (Array.isArray(data)) return data; return []; }
function safeText(v) { return String(v ?? ""); }
function getRoomIdentity(room) { return safeText(room?.id || room?.roomId || room?.name); }
function getRoomKey(room, index) { return getRoomIdentity(room) || `room-${index}`; }
function getMessageKey(message, index) { return safeText(message?.id || message?.messageId) || `message-${index}`; }

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

  async function decodeRooms(raw) {
    const key = getCachedOrgKey(orgId);
    const out = [];
    for (const room of raw) {
      if (room?.encrypted_blob) {
        if (!key) { out.push({ ...room, name: "(encrypted room)" }); continue; }
        try { const clear = JSON.parse(await decryptWithOrgKey(key, room.encrypted_blob)); out.push({ ...room, ...clear }); }
        catch { out.push({ ...room, name: "(encrypted room)" }); }
        continue;
      }
      if (!key || !safeText(room?.name).trim()) { out.push(room); continue; }
      try {
        const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ name: safeText(room.name) }));
        await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: room.id, encrypted_blob }) });
        out.push({ ...room, encrypted_blob });
      } catch { out.push(room); }
    }
    return out;
  }

  async function decodeMessages(raw) {
    const key = getCachedOrgKey(orgId);
    const out = [];
    for (const message of raw) {
      if (message?.encrypted_blob) {
        if (!key) { out.push({ ...message, body: "(encrypted message)" }); continue; }
        try { const clear = JSON.parse(await decryptWithOrgKey(key, message.encrypted_blob)); out.push({ ...message, body: safeText(clear?.body) }); }
        catch { out.push({ ...message, body: "(encrypted message)" }); }
        continue;
      }
      const body = safeText(message?.body);
      if (!key || !body) { out.push(message); continue; }
      try {
        const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ body }));
        await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: message.id, encrypted_blob }) });
        out.push({ ...message, encrypted_blob });
      } catch { out.push(message); }
    }
    return out;
  }

  async function refreshRooms({ clearError = true } = {}) {
    if (!orgId) return;
    setLoadingRooms(true); if (clearError) setRoomsError("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`);
      const nextRooms = await decodeRooms(toItems(data).filter((room) => room && typeof room === "object"));
      setRooms(nextRooms);
      setSelected((previous) => {
        if (!previous) return nextRooms[0] || null;
        const previousKey = getRoomIdentity(previous);
        return nextRooms.find((room) => getRoomIdentity(room) === previousKey) || nextRooms[0] || null;
      });
    } catch (e) { setRooms([]); setSelected(null); setRoomsError(e?.message || "Failed to load chat rooms."); }
    finally { setLoadingRooms(false); }
  }

  async function refreshMessages(room) {
    if (!orgId || !room) { setMessages([]); setMessagesError(""); return; }
    const roomId = getRoomIdentity(room);
    if (!roomId) { setMessages([]); setMessagesError(""); return; }
    setLoadingMessages(true); setMessagesError("");
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages?roomId=${encodeURIComponent(roomId)}`);
      setMessages(await decodeMessages(toMessages(data).filter((message) => message && typeof message === "object")));
    } catch (e) { setMessages([]); setMessagesError(e?.message || "Failed to load messages."); }
    finally { setLoadingMessages(false); }
  }

  async function createRoom() {
    const name = createValue.trim();
    if (!name || !orgId) return;
    const key = getCachedOrgKey(orgId);
    if (!key) { setCreateError("Unlock this organization key before creating a chat room."); return; }
    setCreatingRoom(true); setCreateError("");
    try {
      const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ name }));
      const response = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ encrypted_blob }) });
      setCreateValue("");
      await refreshRooms();
      if (response?.room) setSelected({ ...response.room, name });
    } catch (e) { setCreateError(e?.message || "Failed to create room."); }
    finally { setCreatingRoom(false); }
  }

  async function sendMessage() {
    const body = draft.trim(); const roomId = selectedKey;
    if (!orgId || !roomId || !body) return;
    const key = getCachedOrgKey(orgId);
    if (!key) { setMessagesError("Unlock this organization key before sending chat messages."); return; }
    setSendingMessage(true); setMessagesError("");
    try {
      const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({ body }));
      await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId, encrypted_blob }) });
      setDraft(""); await refreshMessages(selected);
    } catch (e) { setMessagesError(e?.message || "Failed to send message."); }
    finally { setSendingMessage(false); }
  }

  useEffect(() => { refreshRooms().catch(console.error); }, [orgId]);
  useEffect(() => { refreshMessages(selected).catch(console.error); }, [orgId, selectedKey]);
  if (!orgId) return <div style={{ padding: 16 }}>No org selected.</div>;

  return <div className="card" style={{ margin: 16, padding: 12 }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><h2 className="section-title" style={{ margin: 0, flex: 1 }}>Chat</h2></div>
    <div className="helper" style={{ marginTop: 8 }}>Room names and messages are encrypted with this organization&apos;s key before they leave this device.</div>
    <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}><button className="btn" type="button" onClick={() => refreshRooms().catch(console.error)} disabled={loadingRooms || creatingRoom}>{loadingRooms ? "Refreshing..." : "Refresh"}</button></div>
    <form onSubmit={(e) => { e.preventDefault(); createRoom().catch(console.error); }} className="row" style={{ gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
      <input value={createValue} onChange={(e) => setCreateValue(e.target.value)} placeholder="New room name" aria-label="New room name" style={{ minWidth: 220, flex: "1 1 240px" }} disabled={creatingRoom || loadingRooms} />
      <button className="btn" type="submit" disabled={creatingRoom || loadingRooms || !createValue.trim()}>{creatingRoom ? "Creating..." : "Create room"}</button>
    </form>
    {roomsError ? <div className="error" style={{ marginTop: 10 }}>{roomsError}</div> : null}
    {createError ? <div className="error" style={{ marginTop: 10 }}>{createError}</div> : null}
    <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
      <div className="card" style={{ padding: 12 }}><div style={{ fontWeight: 800 }}>Rooms</div><div className="grid" style={{ gap: 8, marginTop: 10 }}>{loadingRooms ? <div className="helper">Loading rooms...</div> : null}{!loadingRooms && rooms.length === 0 ? <div className="helper">No rooms yet. Create the first room above.</div> : null}{!loadingRooms && rooms.map((room, index) => { const roomKey = getRoomKey(room, index); const roomName = safeText(room?.name) || "Untitled room"; const isSelected = selectedKey && selectedKey === getRoomIdentity(room); return <button key={roomKey} className="btn" type="button" onClick={() => setSelected(room)} style={{ textAlign: "left", justifyContent: "flex-start", borderColor: isSelected ? "var(--brand, #4f46e5)" : undefined }}>{roomName}</button>; })}</div></div>
      <div className="card" style={{ padding: 12 }}>
        <div style={{ fontWeight: 800 }}>{safeText(selected?.name) || "Room detail"}</div>
        <div className="card" style={{ padding: 12, marginTop: 12 }}><div style={{ fontWeight: 800 }}>Messages</div>{messagesError ? <div className="error" style={{ marginTop: 8 }}>{messagesError}</div> : null}{loadingMessages ? <div className="helper" style={{ marginTop: 8 }}>Loading messages...</div> : null}{!loadingMessages && selected && messages.length === 0 ? <div className="helper" style={{ marginTop: 8 }}>No messages yet.</div> : null}{!loadingMessages && !selected ? <div className="helper" style={{ marginTop: 8 }}>Select a room to view messages.</div> : null}{!loadingMessages && messages.length > 0 ? <div className="grid" style={{ gap: 8, marginTop: 10 }}>{messages.map((message, index) => <div key={getMessageKey(message, index)} className="card" style={{ padding: 10 }}><div style={{ fontWeight: 700 }}>{safeText(message?.authorLabel) || "Member"}</div><div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{safeText(message?.body)}</div></div>)}</div> : null}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage().catch(console.error); }} className="row" style={{ gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={selected ? "Type a message" : "Select a room first"} aria-label="Message draft" style={{ minWidth: 220, flex: "1 1 240px" }} disabled={!selected || sendingMessage || loadingMessages} /><button className="btn" type="submit" disabled={!selected || sendingMessage || loadingMessages || !draft.trim()}>{sendingMessage ? "Sending..." : "Send"}</button></form>
        </div>
      </div>
    </div>
  </div>;
}
