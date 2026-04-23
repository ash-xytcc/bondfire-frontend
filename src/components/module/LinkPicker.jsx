import React from "react";
import { normalizeLinkedItem } from "../../lib/moduleLinks.js";

export default function LinkPicker({ value, onChange, disabled = false }) {
  const linked = normalizeLinkedItem(value) || { type: "record", id: "", label: "", href: "" };

  function patch(next) {
    const merged = { ...linked, ...next };
    const normalized = normalizeLinkedItem(merged);
    onChange?.(normalized);
  }

  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="helper" style={{ marginBottom: 8 }}>Optional linked item</div>
      <div className="grid" style={{ gap: 8 }}>
        <input
          className="input"
          value={linked.type}
          placeholder="type (event, need, drive_file, etc)"
          disabled={disabled}
          onChange={(e) => patch({ type: e.target.value })}
        />
        <input
          className="input"
          value={linked.id}
          placeholder="record id"
          disabled={disabled}
          onChange={(e) => patch({ id: e.target.value })}
        />
        <input
          className="input"
          value={linked.label}
          placeholder="display label"
          disabled={disabled}
          onChange={(e) => patch({ label: e.target.value })}
        />
        <input
          className="input"
          value={linked.href}
          placeholder="optional relative or full link"
          disabled={disabled}
          onChange={(e) => patch({ href: e.target.value })}
        />
        <button
          className="btn"
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(null)}
        >
          Clear linked item
        </button>
      </div>
    </div>
  );
}
