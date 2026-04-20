import React from "react";

async function authFetch(path, opts = {}) {
  const headers = {
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(path, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
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

const PAGE_THEME = {
  bgElev: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72)",
  border: "rgba(255,255,255,0.08)",
  text: "#f3efe8",
  muted: "#d7ddd8",
  accent: "#93b4f0",
  inputBg: "rgba(255,255,255,0.06)",
  inputText: "#f3efe8",
};

const EMPTY_DRAFT = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  tags: "",
  durationText: "",
  metaText: "",
  featured: false,
};

function pill(active = false) {
  return {
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "10px 14px",
    cursor: "pointer",
    background: active ? "var(--accent)" : "rgba(255,255,255,0.05)",
    color: active ? "#121715" : "var(--text)",
    fontWeight: 700,
    fontSize: 14,
  };
}

export default function DpgVideosPage() {
  const [status, setStatus] = React.useState("Loading video manager…");
  const [error, setError] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");
  const [draft, setDraft] = React.useState(EMPTY_DRAFT);

  const loadShares = React.useCallback(async () => {
    setError("");
    setStatus("Loading video manager…");

    try {
      const res = await authFetch("/api/orgs/dpg/shares", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const msg =
          res?.data?.error ||
          res?.data?.detail ||
          res?.data?.message ||
          res?.data?.raw ||
          `HTTP ${res.status}`;
        setItems([]);
        setError(String(msg));
        setStatus("Video manager loaded with API error.");
        return;
      }

      const shares = Array.isArray(res?.data?.shares) ? res.data.shares : [];
      setItems(shares);
      setStatus(`Video manager ready. ${shares.length} entr${shares.length === 1 ? "y" : "ies"} loaded.`);
    } catch (e) {
      setItems([]);
      setError(String(e?.message || e));
      setStatus("Video manager loaded with runtime error.");
    }
  }, []);

  React.useEffect(() => {
    loadShares();
  }, [loadShares]);

  function resetForm() {
    setEditingId("");
    setDraft(EMPTY_DRAFT);
  }

  function beginEdit(item) {
    setEditingId(String(item?.id || ""));
    setDraft({
      title: item?.title || "",
      description: item?.description || "",
      videoUrl: item?.videoUrl || "",
      thumbnailUrl: item?.thumbnailUrl || "",
      tags: Array.isArray(item?.tags) ? item.tags.join(", ") : "",
      durationText: item?.durationText || "",
      metaText: item?.metaText || "",
      featured: !!item?.featured,
    });
    setStatus("Editing existing entry.");
    setError("");
  }

  async function saveVideo(statusValue = "published") {
    const title = String(draft.title || "").trim();
    const videoUrl = String(draft.videoUrl || "").trim();

    if (!title) {
      setError("Title is required.");
      return;
    }
    if (!videoUrl) {
      setError("Video URL is required for this phase.");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Saving video entry…");

    try {
      const body = {
        ...draft,
        status: statusValue,
        tags: String(draft.tags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      const res = await authFetch("/api/orgs/dpg/shares", {
        method: editingId ? "PATCH" : "POST",
        body: editingId ? { id: editingId, ...body } : body,
      });

      if (!res.ok) {
        throw new Error(
          res?.data?.error ||
          res?.data?.detail ||
          res?.data?.message ||
          res?.data?.raw ||
          `HTTP ${res.status}`
        );
      }

      resetForm();
      await loadShares();
      setStatus(editingId ? "Video entry updated." : "Video entry created.");
    } catch (e) {
      setError(String(e?.message || e));
      setStatus("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function unpublish(item) {
    setBusy(true);
    setError("");
    setStatus("Unpublishing entry…");

    try {
      const res = await authFetch("/api/orgs/dpg/shares", {
        method: "PATCH",
        body: {
          id: item?.id,
          title: item?.title || "",
          description: item?.description || "",
          videoUrl: item?.videoUrl || "",
          thumbnailUrl: item?.thumbnailUrl || "",
          tags: Array.isArray(item?.tags) ? item.tags : [],
          durationText: item?.durationText || "",
          metaText: item?.metaText || "",
          featured: false,
          status: "draft",
        },
      });

      if (!res.ok) {
        throw new Error(
          res?.data?.error ||
          res?.data?.detail ||
          res?.data?.message ||
          res?.data?.raw ||
          `HTTP ${res.status}`
        );
      }

      if (String(editingId || "") === String(item?.id || "")) resetForm();
      await loadShares();
      setStatus("Video entry unpublished.");
    } catch (e) {
      setError(String(e?.message || e));
      setStatus("Unpublish failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        "--bg-elev": PAGE_THEME.bgElev,
        "--border": PAGE_THEME.border,
        "--text": PAGE_THEME.text,
        "--muted": PAGE_THEME.muted,
        "--accent": PAGE_THEME.accent,
        "--input-bg": PAGE_THEME.inputBg,
        "--input-text": PAGE_THEME.inputText,
        padding: 20,
        color: "var(--text)",
      }}
    >
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: 22,
          background: "var(--bg-elev)",
          boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
          marginBottom: 20,
          display: "grid",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 0.95, color: "var(--accent)", textTransform: "lowercase" }}>
          videos
        </h1>

        <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>
          Dedicated backend manager for DPG Shares. This is phase one: private CRUD over existing share records.
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text)",
            fontSize: 14,
          }}
        >
          {status}
        </div>

        {error ? (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,120,120,0.20)",
              background: "rgba(255,120,120,0.08)",
              color: "#ffb8b8",
              fontSize: 14,
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveVideo("published");
          }}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: 22,
            background: "var(--bg-elev)",
            boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)", textTransform: "lowercase" }}>
            {editingId ? "edit video entry" : "new video entry"}
          </div>

          <input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="title" style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, background: "var(--input-bg)", color: "var(--input-text)" }} />
          <input value={draft.videoUrl} onChange={(e) => setDraft((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="video URL" style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, background: "var(--input-bg)", color: "var(--input-text)" }} />
          <input value={draft.thumbnailUrl} onChange={(e) => setDraft((p) => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="thumbnail URL" style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, background: "var(--input-bg)", color: "var(--input-text)" }} />
          <input value={draft.tags} onChange={(e) => setDraft((p) => ({ ...p, tags: e.target.value }))} placeholder="tags, comma separated" style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, background: "var(--input-bg)", color: "var(--input-text)" }} />
          <input value={draft.durationText} onChange={(e) => setDraft((p) => ({ ...p, durationText: e.target.value }))} placeholder="duration text" style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, background: "var(--input-bg)", color: "var(--input-text)" }} />
          <input value={draft.metaText} onChange={(e) => setDraft((p) => ({ ...p, metaText: e.target.value }))} placeholder="meta text" style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, background: "var(--input-bg)", color: "var(--input-text)" }} />
          <textarea value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="description" rows={5} style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", fontSize: 16, resize: "vertical", background: "var(--input-bg)", color: "var(--input-text)" }} />

          <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
            <input type="checkbox" checked={!!draft.featured} onChange={(e) => setDraft((p) => ({ ...p, featured: e.target.checked }))} />
            mark as featured
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="submit" disabled={busy} style={pill(true)}>
              {busy ? "saving..." : editingId ? "save changes" : "publish entry"}
            </button>
            <button type="button" disabled={busy} onClick={() => saveVideo("draft")} style={pill(false)}>
              save as draft
            </button>
            {editingId ? (
              <button type="button" disabled={busy} onClick={resetForm} style={pill(false)}>
                cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: 22,
            background: "var(--bg-elev)",
            boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)", textTransform: "lowercase" }}>
            archive entries
          </div>

          {!items.length ? (
            <div style={{ color: "var(--muted)" }}>no entries loaded yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ color: "var(--text)", fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>
                    {item.status} • {item.slug || "no-slug"}{item.featured ? " • featured" : ""}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => beginEdit(item)} style={pill(false)}>
                      edit
                    </button>
                    {item.status === "published" ? (
                      <button type="button" onClick={() => unpublish(item)} style={pill(false)} disabled={busy}>
                        unpublish
                      </button>
                    ) : null}
                    {item.slug ? (
                      <a href={`/dpg-shares/${item.slug}`} style={{ ...pill(false), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        view public
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
