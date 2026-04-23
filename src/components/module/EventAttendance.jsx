import React from "react";

const STATUSES = ["going", "maybe", "not_going"];

export default function EventAttendance({ entries, loading, onAdd, onRemove }) {
  const [form, setForm] = React.useState({ name: "", role: "", status: "going" });

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 800 }}>Attendance</div>
      <div className="grid cols-3" style={{ gap: 8, marginTop: 10 }}>
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="input" placeholder="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} />
        <select className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          className="btn"
          type="button"
          onClick={() => {
            const name = form.name.trim();
            if (!name) return;
            onAdd?.({ ...form, name });
            setForm({ name: "", role: "", status: "going" });
          }}
        >
          Add attendance
        </button>
      </div>

      {loading ? <div className="helper" style={{ marginTop: 10 }}>Loading attendance…</div> : null}
      {!loading && !entries.length ? <div className="helper" style={{ marginTop: 10 }}>No attendance entries yet.</div> : null}

      <div className="grid" style={{ gap: 8, marginTop: 10 }}>
        {entries.map((item) => (
          <div className="card" key={item.id} style={{ padding: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div className="helper">{item.role || "No role"} · {item.status}</div>
            </div>
            <button className="btn" type="button" onClick={() => onRemove?.(item.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
