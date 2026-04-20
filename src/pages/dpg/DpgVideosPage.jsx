import React from "react";

export default function DpgVideosPage() {
  const [status, setStatus] = React.useState("rendered");
  const [count, setCount] = React.useState("not loaded");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let dead = false;

    (async () => {
      try {
        setStatus("fetching /api/orgs/dpg/shares");
        const res = await fetch("/api/orgs/dpg/shares", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const text = await res.text().catch(() => "");
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { raw: text };
        }

        if (dead) return;

        if (!res.ok || data?.ok === false) {
          setStatus("api error");
          setError(String(data?.error || data?.detail || data?.message || data?.raw || `HTTP ${res.status}`));
          return;
        }

        const shares = Array.isArray(data?.shares) ? data.shares : [];
        setStatus("loaded");
        setCount(String(shares.length));
      } catch (e) {
        if (dead) return;
        setStatus("runtime error");
        setError(String(e?.message || e));
      }
    })();

    return () => {
      dead = true;
    };
  }, []);

  return (
    <div style={{ padding: 24, color: "#f3efe8" }}>
      <div
        style={{
          border: "2px solid #93b4f0",
          borderRadius: 20,
          padding: 24,
          background: "rgba(255,255,255,0.05)",
          boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
          maxWidth: 980,
        }}
      >
        <div
          style={{
            color: "#93b4f0",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 12,
          }}
        >
          dpg shares backend
        </div>

        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1 }}>
          videos page is rendering
        </h1>

        <div style={{ marginTop: 16, color: "#d7ddd8", lineHeight: 1.6 }}>
          This is a hard-reset backend page. If you can read this, the route is working and the page component is alive.
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          <div><strong>status:</strong> {status}</div>
          <div><strong>count:</strong> {count}</div>
          {error ? (
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(255,120,120,0.24)",
                background: "rgba(255,120,120,0.08)",
                color: "#ffb8b8",
                whiteSpace: "pre-wrap",
              }}
            >
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
