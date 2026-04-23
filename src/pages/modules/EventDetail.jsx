import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api.js";
import EventAttendance from "../../components/module/EventAttendance.jsx";
import EventNotes from "../../components/module/EventNotes.jsx";

export default function EventDetail() {
  const { orgId, eventId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function refresh() {
    if (!orgId || !eventId) return;
    setLoading(true);
    setErr("");
    try {
      const [a, n] = await Promise.all([
        api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}/attendance`),
        api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}/notes`),
      ]);
      setAttendance(Array.isArray(a?.entries) ? a.entries : []);
      setNotes(Array.isArray(n?.notes) ? n.notes : []);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, [orgId, eventId]);

  async function addAttendance(payload) {
    await api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await refresh();
  }

  async function removeAttendance(id) {
    await api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}/attendance?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await refresh();
  }

  async function addNote(payload) {
    await api(`/api/orgs/${encodeURIComponent(orgId)}/events/${encodeURIComponent(eventId)}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await refresh();
  }

  return (
    <div className="grid" style={{ gap: 12, padding: 16 }}>
      <div className="card" style={{ padding: 12 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Event detail</h2>
        <div className="helper" style={{ marginTop: 6 }}>Event ID: {eventId || "missing"}</div>
        {err ? <div className="error" style={{ marginTop: 8 }}>{err}</div> : null}
      </div>

      <EventAttendance
        entries={attendance}
        loading={loading}
        onAdd={(payload) => addAttendance(payload).catch((e) => setErr(e?.message || String(e)))}
        onRemove={(id) => removeAttendance(id).catch((e) => setErr(e?.message || String(e)))}
      />

      <EventNotes
        notes={notes}
        loading={loading}
        onAdd={(payload) => addNote(payload).catch((e) => setErr(e?.message || String(e)))}
      />
    </div>
  );
}
