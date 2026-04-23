import React from "react";
import LinkPicker from "./LinkPicker.jsx";

function fmt(ts) {
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function EventNotes({ notes, loading, onAdd }) {
  const [body, setBody] = React.useState("");
  const [linkedItem, setLinkedItem] = React.useState(null);

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 800 }}>Internal timeline / notes</div>

      <textarea
        className="textarea"
        rows={4}
        value={body}
        placeholder="Add planning note"
        onChange={(e) => setBody(e.target.value)}
        style={{ marginTop: 10 }}
      />
      <div style={{ marginTop: 8 }}>
        <LinkPicker value={linkedItem} onChange={setLinkedItem} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          className="btn"
          type="button"
          disabled={!body.trim()}
          onClick={() => {
            const text = body.trim();
            if (!text) return;
            onAdd?.({ body: text, linked_item: linkedItem });
            setBody("");
            setLinkedItem(null);
          }}
        >
          Add note
        </button>
      </div>

      {loading ? <div className="helper" style={{ marginTop: 10 }}>Loading notes…</div> : null}
      {!loading && !notes.length ? <div className="helper" style={{ marginTop: 10 }}>No notes yet.</div> : null}

      <div className="grid" style={{ gap: 8, marginTop: 10 }}>
        {notes.map((n) => (
          <div className="card" key={n.id} style={{ padding: 10 }}>
            <div className="helper" style={{ marginBottom: 6 }}>
              {n.author_label || "member"} · {fmt(n.created_at)}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{n.body}</div>
            {n.linked_item?.label ? (
              <div className="helper" style={{ marginTop: 6 }}>
                Linked: {n.linked_item.href ? <a href={n.linked_item.href}>{n.linked_item.label}</a> : n.linked_item.label}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
