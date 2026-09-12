// src/pages/MeetingDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/api.js";
import { decryptWithOrgKey, encryptWithOrgKey, getCachedOrgKey } from "../lib/zk.js";

function getOrgId() {
  try {
    const m = (window.location.hash || "").match(/#\/org\/([^/]+)/);
    return m && m[1] ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function toLocalDateTimeInput(valueMs) {
  if (!valueMs) return "";
  const d = new Date(Number(valueMs));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDateTimeInput(s) {
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? ms : null;
}

const emptyCounts = () => ({
  combined: { yes: 0, maybe: 0, no: 0, total: 0 },
  member: { yes: 0, maybe: 0, no: 0, total: 0 },
  public: { yes: 0, maybe: 0, no: 0, total: 0 },
});

export default function MeetingDetail() {
  const nav = useNavigate();
  const { meetingId, orgId: orgIdParam } = useParams();
  const orgId = orgIdParam || getOrgId();

  const [m, setM] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [myRsvp, setMyRsvp] = useState(null);
  const [rsvpCounts, setRsvpCounts] = useState(emptyCounts());
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpMsg, setRsvpMsg] = useState("");

  async function decryptMeeting(row) {
    if (!row?.encrypted_blob) return row;
    const key = getCachedOrgKey(orgId);
    if (!key) {
      return { ...row, title: "(encrypted)", location: "", agenda: "", notes: "" };
    }
    try {
      const clear = JSON.parse(await decryptWithOrgKey(key, row.encrypted_blob));
      return { ...row, ...clear };
    } catch {
      return { ...row, title: "(encrypted)", location: "", agenda: "", notes: "" };
    }
  }

  async function refresh() {
    if (!orgId || !meetingId) return;
    const bust = `ts=${Date.now()}`;
    const data = await api(`/api/orgs/${encodeURIComponent(orgId)}/meetings/${encodeURIComponent(meetingId)}?${bust}`);
    const meeting = await decryptMeeting(data.meeting || null);
    setM(meeting);
    setRsvpCounts(data?.meeting?.rsvp_counts || emptyCounts());

    try {
      const r = await api(`/api/orgs/${encodeURIComponent(orgId)}/meetings/${encodeURIComponent(meetingId)}/rsvp?ts=${Date.now()}`);
      if (r && Object.prototype.hasOwnProperty.call(r, "my_rsvp")) setMyRsvp(r.my_rsvp);
      else if (r && Object.prototype.hasOwnProperty.call(r, "rsvp")) setMyRsvp(r.rsvp);
      else setMyRsvp(null);
    } catch {
      setMyRsvp(null);
    }
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e?.message || String(e)));
  }, [orgId, meetingId]);

  async function save(patch) {
    if (!orgId || !meetingId || !m) return;
    setBusy(true);
    setErr("");
    try {
      const next = { ...m, ...patch };
      const isPublic = !!next.is_public;
      let payload;

      if (isPublic) {
        payload = {
          ...patch,
          is_public: true,
          title: String(next.title || ""),
          location: String(next.location || ""),
          agenda: String(next.agenda || ""),
          notes: String(next.notes || ""),
        };
      } else {
        const key = getCachedOrgKey(orgId);
        if (!key) throw new Error("Unlock this organization key before editing private meeting content.");
        const encrypted_blob = await encryptWithOrgKey(key, JSON.stringify({
          title: String(next.title || ""),
          location: String(next.location || ""),
          agenda: String(next.agenda || ""),
          notes: String(next.notes || ""),
        }));
        payload = {
          ...patch,
          is_public: false,
          title: "",
          location: "",
          agenda: "",
          notes: "",
          encrypted_blob,
        };
      }

      await api(`/api/orgs/${encodeURIComponent(orgId)}/meetings/${encodeURIComponent(meetingId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await refresh();
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!orgId || !meetingId) return;
    if (!confirm("Delete this meeting?")) return;
    setBusy(true);
    setErr("");
    try {
      await api(`/api/orgs/${encodeURIComponent(orgId)}/meetings/${encodeURIComponent(meetingId)}`, { method: "DELETE" });
      nav(`/org/${encodeURIComponent(orgId)}/meetings`, { replace: true });
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function setRsvp(status) {
    if (!orgId || !meetingId) return;
    setRsvpMsg("");
    setRsvpBusy(true);
    try {
      const note = myRsvp?.note || "";
      await api(`/api/orgs/${encodeURIComponent(orgId)}/meetings/${encodeURIComponent(meetingId)}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      setRsvpMsg("Saved.");
      await refresh();
      setTimeout(() => setRsvpMsg(""), 900);
    } catch (e) {
      setRsvpMsg(e?.message || "RSVP failed");
    } finally {
      setRsvpBusy(false);
    }
  }

  if (!orgId) return <div style={{ padding: 16 }}>No org selected.</div>;
  if (!m) return <div style={{ padding: 16 }}>{err ? `Error: ${err}` : "Loading..."}</div>;

  return (
    <div className="card" style={{ margin: 16, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <h2 className="section-title" style={{ margin: 0, flex: 1 }}>Meeting</h2>
        <button className="btn" onClick={() => nav(-1)} disabled={busy}>Back</button>
        <button className="btn" onClick={del} disabled={busy}>Delete</button>
      </div>

      {err ? <div className="helper" style={{ color: "tomato", marginTop: 8 }}>{err}</div> : null}

      <div className="grid" style={{ gap: 10, marginTop: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800 }}>RSVP Summary</div>
            <div className="helper">{Number(rsvpCounts?.combined?.total || 0)} total responses</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 10 }}>
            <div className="card" style={{ padding: 10 }}><div className="helper">Yes</div><div style={{ fontWeight: 900, fontSize: 24 }}>{Number(rsvpCounts?.combined?.yes || 0)}</div></div>
            <div className="card" style={{ padding: 10 }}><div className="helper">Maybe</div><div style={{ fontWeight: 900, fontSize: 24 }}>{Number(rsvpCounts?.combined?.maybe || 0)}</div></div>
            <div className="card" style={{ padding: 10 }}><div className="helper">No</div><div style={{ fontWeight: 900, fontSize: 24 }}>{Number(rsvpCounts?.combined?.no || 0)}</div></div>
            <div className="card" style={{ padding: 10 }}><div className="helper">Public RSVPs</div><div style={{ fontWeight: 900, fontSize: 24 }}>{Number(rsvpCounts?.public?.total || 0)}</div></div>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800 }}>Your RSVP</div>
            <div className="helper" style={{ opacity: 0.9 }}>{myRsvp?.status ? String(myRsvp.status) : "none"}</div>
            <div style={{ flex: 1 }} />
            {rsvpMsg ? <div className={String(rsvpMsg).toLowerCase().includes("fail") ? "error" : "helper"}>{rsvpMsg}</div> : null}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn" type="button" onClick={() => setRsvp("yes")} disabled={busy || rsvpBusy}>Yes</button>
            <button className="btn" type="button" onClick={() => setRsvp("maybe")} disabled={busy || rsvpBusy}>Maybe</button>
            <button className="btn" type="button" onClick={() => setRsvp("no")} disabled={busy || rsvpBusy}>No</button>
          </div>
        </div>

        <input className="input" value={m.title || ""} placeholder="Title" onChange={(e) => setM((prev) => ({ ...prev, title: e.target.value }))} onBlur={(e) => save({ title: e.target.value || "" }).catch(console.error)} />

        <div className="grid cols-2" style={{ gap: 10 }}>
          <div>
            <div className="helper">Start</div>
            <input className="input" type="datetime-local" value={toLocalDateTimeInput(m.starts_at)} onChange={(e) => setM((prev) => ({ ...prev, starts_at: fromLocalDateTimeInput(e.target.value) }))} onBlur={(e) => save({ starts_at: fromLocalDateTimeInput(e.target.value) }).catch(console.error)} />
          </div>
          <div>
            <div className="helper">End</div>
            <input className="input" type="datetime-local" value={toLocalDateTimeInput(m.ends_at)} onChange={(e) => setM((prev) => ({ ...prev, ends_at: fromLocalDateTimeInput(e.target.value) }))} onBlur={(e) => save({ ends_at: fromLocalDateTimeInput(e.target.value) }).catch(console.error)} />
          </div>
        </div>

        <input className="input" value={m.location || ""} placeholder="Location" onChange={(e) => setM((prev) => ({ ...prev, location: e.target.value }))} onBlur={(e) => save({ location: e.target.value || "" }).catch(console.error)} />

        <label className="row" style={{ gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={!!m.is_public} onChange={(e) => {
            const is_public = e.target.checked;
            setM((prev) => ({ ...prev, is_public }));
            save({ is_public }).catch(console.error);
          }} />
          <span>Public (show on public page)</span>
        </label>

        <textarea className="textarea" value={m.agenda || ""} placeholder="Agenda" rows={4} onChange={(e) => setM((prev) => ({ ...prev, agenda: e.target.value }))} onBlur={(e) => save({ agenda: e.target.value || "" }).catch(console.error)} />
        <textarea className="textarea" value={m.notes || ""} placeholder="Notes" rows={6} onChange={(e) => setM((prev) => ({ ...prev, notes: e.target.value }))} onBlur={(e) => save({ notes: e.target.value || "" }).catch(console.error)} />
      </div>
    </div>
  );
}
