import React from "react";

export default function ChatComposer({ disabled, onSend }) {
  const [text, setText] = React.useState("");

  return (
    <div className="card" style={{ padding: 12 }}>
      <textarea
        className="textarea"
        rows={3}
        value={text}
        placeholder="Type a message"
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        <button
          className="btn"
          type="button"
          disabled={disabled || !text.trim()}
          onClick={() => {
            const msg = text.trim();
            if (!msg) return;
            onSend?.(msg);
            setText("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
