import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api.js";
import ChatRoomList from "../../components/module/ChatRoomList.jsx";
import ChatMessageList from "../../components/module/ChatMessageList.jsx";
import ChatComposer from "../../components/module/ChatComposer.jsx";

export default function Chat() {
  const { orgId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [err, setErr] = useState("");

  async function loadRooms() {
    if (!orgId) return;
    setRoomLoading(true);
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`);
      const nextRooms = Array.isArray(data?.rooms) ? data.rooms : [];
      setRooms(nextRooms);
      if (!roomId && nextRooms[0]?.id) setRoomId(nextRooms[0].id);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setRoomLoading(false);
    }
  }

  async function loadMessages(targetRoomId = roomId) {
    if (!orgId || !targetRoomId) return;
    setMsgLoading(true);
    try {
      const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages?room_id=${encodeURIComponent(targetRoomId)}`);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setMsgLoading(false);
    }
  }

  useEffect(() => {
    loadRooms().catch(() => {});
  }, [orgId]);

  useEffect(() => {
    loadMessages().catch(() => {});
  }, [orgId, roomId]);

  async function createRoom(name) {
    await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await loadRooms();
  }

  async function saveTopic(id, topic) {
    await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/rooms`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, topic }),
    });
    await loadRooms();
  }

  async function sendMessage(body) {
    await api(`/api/orgs/${encodeURIComponent(orgId)}/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId, body }),
    });
    await loadMessages();
  }

  return (
    <div className="grid cols-2" style={{ padding: 16, gap: 12 }}>
      <ChatRoomList
        rooms={rooms}
        activeRoomId={roomId}
        loading={roomLoading}
        onSelect={(room) => setRoomId(room.id)}
        onCreateRoom={(name) => createRoom(name).catch((e) => setErr(e?.message || String(e)))}
        onSaveTopic={(id, topic) => saveTopic(id, topic).catch((e) => setErr(e?.message || String(e)))}
      />

      <div className="grid" style={{ gap: 10 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Messages</div>
          {!roomId ? <div className="helper">Select a room.</div> : <ChatMessageList messages={messages} loading={msgLoading} />}
        </div>
        <ChatComposer disabled={!roomId} onSend={(text) => sendMessage(text).catch((e) => setErr(e?.message || String(e)))} />
      </div>

      {err ? <div className="error">{err}</div> : null}
    </div>
  );
}
