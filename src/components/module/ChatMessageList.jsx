import React from "react";

function fmt(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function ChatMessageList({ messages, loading }) {
  if (loading) return <div className="helper">Loading messages…</div>;
  if (!messages.length) return <div className="helper">No messages yet.</div>;

  return (
    <div className="grid" style={{ gap: 8 }}>
      {messages.map((m) => (
        <div className="card" key={m.id} style={{ padding: 10 }}>
          <div className="helper" style={{ marginBottom: 6 }}>
            {m.author_label || "member"} · {fmt(m.created_at)}
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
          {m.linked_item?.label ? (
            <div className="helper" style={{ marginTop: 6 }}>
              Linked: {m.linked_item.label}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
