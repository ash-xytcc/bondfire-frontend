import React from "react";

async function loadJson(path) {
  const res = await fetch(path, {
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

  return {
    ok: !!(res.ok && data?.ok !== false),
    status: res.status,
    data,
  };
}

export default function DpgVideosPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    let dead = false;

    (async () => {
      try {
        const res = await loadJson("/api/orgs/dpg/shares");
        if (dead) return;

        if (!res.ok) {
          setError(
            String(
              res?.data?.error ||
              res?.data?.detail ||
              res?.data?.message ||
              res?.data?.raw ||
              `HTTP ${res.status}`
            )
          );
          setItems([]);
          setLoading(false);
          return;
        }

        setItems(Array.isArray(res?.data?.shares) ? res.data.shares : []);
        setError("");
        setLoading(false);
      } catch (e) {
        if (dead) return;
        setError(String(e?.message || e));
        setItems([]);
        setLoading(false);
      }
    })();

    return () => {
      dead = true;
    };
  }, []);

  return (
    <div style={{ padding: 20, color: "#f3efe8" }}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 20,
          background: "rgba(255,255,255,0.04)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            color: "#93b4f0",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 10,
          }}
        >
          DPG Shares backend
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            lineHeight: 1,
            color: "#f3efe8",
          }}
        >
          videos
        </h1>

        <div style={{ marginTop: 12, color: "#d7ddd8", lineHeight: 1.55 }}>
          This page is rendering. Phase one backend manager is live. R2 upload flow comes next.
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 20,
          background: "rgba(255,255,255,0.04)",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 800, color: "#f3efe8" }}>status</div>

        {loading ? (
          <div style={{ color: "#d7ddd8" }}>Loading shares…</div>
        ) : error ? (
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
        ) : (
          <div style={{ color: "#d7ddd8" }}>
            Loaded {items.length} video entr{items.length === 1 ? "y" : "ies"}.
          </div>
        )}

        <div style={{ fontWeight: 800, color: "#f3efe8", marginTop: 8 }}>records</div>

        {!loading && !error && !items.length ? (
          <div style={{ color: "#d7ddd8" }}>No share records found yet.</div>
        ) : null}

        {!loading && !error && items.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 14,
                  background: "rgba(255,255,255,0.03)",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ color: "#f3efe8", fontWeight: 800 }}>
                  {item.title || "(untitled)"}
                </div>
                <div style={{ color: "#d7ddd8", fontSize: 14 }}>
                  {item.status || "draft"} • {item.slug || "no-slug"}{item.featured ? " • featured" : ""}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
