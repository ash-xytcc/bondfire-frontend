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

const VIDEO_THEME = {
  bgElev: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72)",
  border: "rgba(255,255,255,0.08)",
  text: "#f3efe8",
  muted: "#d7ddd8",
  accent: "#93b4f0",
  inputBg: "rgba(255,255,255,0.06)",
  inputText: "#f3efe8",
};

const VIDEOS_MOBILE_CSS = `
  @media (max-width: 820px) {
    .dpg-videos-top-grid {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }
    .dpg-videos-form-grid {
      grid-template-columns: 1fr !important;
    }
    .dpg-videos-title {
      font-size: clamp(2.4rem, 12vw, 4rem) !important;
    }
    .dpg-videos-subcopy {
      font-size: 18px !important;
    }
  }
`;

function pillStyle(active = false) {
  return {
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    background: active ? "var(--accent)" : "rgba(255,255,255,0.05)",
    color: active ? "#121715" : "var(--text)",
    fontWeight: 700,
    fontSize: 14,
  };
}

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

export default function DpgVideosPage() {
  const [state, setState] = React.useState({ loading: true, items: [], error: "" });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [editingId, setEditingId] = React.useState("");
  const [draft, setDraft] = React.useState(EMPTY_DRAFT);
  const [query, setQuery] = React.useState("");

  const loadShares = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await authFetch("/api/orgs/dpg/shares", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const detail =
          res?.data?.error ||
          res?.data?.detail ||
          res?.data?.message ||
          res?.data?.raw ||
          `HTTP ${res.status}`;
        setState({ loading: false, items: [], error: String(detail || "Failed to load shares") });
        return;
      }

      setState({
        loading: false,
        items: Array.isArray(res?.data?.shares) ? res.data.shares : [],
        error: "",
      });
    } catch (e) {
      setState({ loading: false, items: [], error: String(e?.message || e) });
    }
  }, []);

  React.useEffect(() => {
    loadShares();
  }, [loadShares]);

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
    setMsg("Editing existing video entry.");
  }

  function resetForm() {
    setEditingId("");
    setDraft(EMPTY_DRAFT);
    setMsg("");
  }

  async function saveVideo(status = "published") {
    const title = String(draft.title || "").trim();
    const videoUrl = String(draft.videoUrl || "").trim();

    if (!title) {
      setMsg("Title is required.");
      return;
    }
    if (!videoUrl) {
      setMsg("Video URL is required for phase 1.");
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const body = {
        ...draft,
        status,
        tags: String(draft.tags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      if (editingId) {
        const res = await authFetch("/api/orgs/dpg/shares", {
          method: "PATCH",
          body: { id: editingId, ...body },
        });
        if (!res.ok) {
          throw new Error(res?.data?.error || res?.data?.detail || res?.data?.message || `HTTP ${res.status}`);
        }
      } else {
        const res = await authFetch("/api/orgs/dpg/shares", {
          method: "POST",
          body,
        });
        if (!res.ok) {
          throw new Error(res?.data?.error || res?.data?.detail || res?.data?.message || `HTTP ${res.status}`);
        }
      }

      await loadShares();
      const wasEditing = !!editingId;
      resetForm();
      setMsg(wasEditing ? "Video entry updated." : "Video entry created.");
    } catch (e) {
      setMsg(String(e?.message || e || "Failed to save video entry"));
    } finally {
      setBusy(false);
    }
  }

  async function unpublish(item) {
    setBusy(true);
    setMsg("");
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
        throw new Error(res?.data?.error || res?.data?.detail || res?.data?.message || `HTTP ${res.status}`);
      }
      await loadShares();
      if (String(editingId || "") === String(item?.id || "")) resetForm();
      setMsg("Video entry unpublished.");
    } catch (e) {
      setMsg(String(e?.message || e || "Failed to unpublish video entry"));
    } finally {
      setBusy(false);
    }
  }

  const filtered = React.useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return state.items;
    return state.items.filter((item) => {
      const hay = [
        item?.title || "",
        item?.description || "",
        item?.metaText || "",
        ...(Array.isArray(item?.tags) ? item.tags : []),
        item?.slug || "",
        item?.status || "",
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [state.items, query]);

  return (
    <div
      style={{
        "--bg-elev": VIDEO_THEME.bgElev,
        "--border": VIDEO_THEME.border,
        "--text": VIDEO_THEME.text,
        "--muted": VIDEO_THEME.muted,
        "--accent": VIDEO_THEME.accent,
        "--input-bg": VIDEO_THEME.inputBg,
        "--input-text": VIDEO_THEME.inputText,
        padding: 0,
        background: "transparent",
        minHeight: "100%",
        color: "var(--text)",
      }}
    >
      <style>{VIDEOS_MOBILE_CSS}</style>

      <div
        style={{
          marginBottom: 12,
          padding: 12,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        DPG Videos backend is loading.
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: 22,
          background: "var(--bg-elev)",
          boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
          marginBottom: 20,
        }}
      >
        <h1
          className="dpg-videos-title"
          style={{
            margin: 0,
            fontSize: "clamp(2.6rem, 6vw, 5.4rem)",
            lineHeight: 0.95,
            color: "var(--accent)",
            textTransform: "lowercase",
          }}
        >
          videos
        </h1>

        <p
          className="dpg-videos-subcopy"
          style={{
            margin: "16px 0 0",
            fontSize: 20,
            lineHeight: 1.45,
            color: "var(--muted)",
            maxWidth: 1100,
          }}
        >
          Dedicated backend management for DPG Shares. Phase 1 keeps the existing share records
          and makes video management live in the private app where it belongs.
        </p>
      </div>

      <div
        className="dpg-videos-top-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr 0.92fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveVideo("published");
          }}
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--accent)",
              textTransform: "lowercase",
            }}
          >
            {editingId ? "edit video entry" : "new video entry"}
          </div>

          <div
            className="dpg-videos-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <input
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="title"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "12px 14px",
                fontSize: 16,
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            <input
              value={draft.videoUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="video URL"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "12px 14px",
                fontSize: 16,
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            <input
              value={draft.thumbnailUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="thumbnail URL"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "12px 14px",
                fontSize: 16,
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            <input
              value={draft.tags}
              onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="tags, comma separated"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "12px 14px",
                fontSize: 16,
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            <input
              value={draft.durationText}
              onChange={(e) => setDraft((prev) => ({ ...prev, durationText: e.target.value }))}
              placeholder="duration text"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "12px 14px",
                fontSize: 16,
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            <input
              value={draft.metaText}
              onChange={(e) => setDraft((prev) => ({ ...prev, metaText: e.target.value }))}
              placeholder="meta text"
              style={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: "12px 14px",
                fontSize: 16,
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
          </div>

          <textarea
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="description"
            rows={5}
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              padding: "12px 14px",
              fontSize: 16,
              resize: "vertical",
              background: "var(--input-bg)",
              color: "var(--input-text)",
            }}
          />

          <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={!!draft.featured}
              onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))}
            />
            mark as featured
          </label>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <button type="submit" disabled={busy} style={pillStyle(true)}>
              {busy ? "saving..." : editingId ? "save changes" : "publish entry"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => saveVideo("draft")}
              style={pillStyle(false)}
            >
              save as draft
            </button>

            {editingId ? (
              <button type="button" disabled={busy} onClick={resetForm} style={pillStyle(false)}>
                cancel edit
              </button>
            ) : null}

            {msg ? (
              <span style={{ color: msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("required") ? "#ffb8b8" : "#9fd3ab", fontSize: 14 }}>
                {msg}
              </span>
            ) : null}
          </div>
        </form>

        <div
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--accent)",
              textTransform: "lowercase",
            }}
          >
            phase 1
          </div>

          <div style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.5 }}>
            This page is the dedicated backend surface for DPG video entries. It replaces the
            weird public-side admin composer as the primary place to manage the archive.
          </div>

          <div style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.5 }}>
            Right now it uses the existing shares CRUD with URL-based media. Next phase swaps the
            video URL input for an R2 upload flow and stored file keys.
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search title, tags, slug, status"
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              padding: "12px 14px",
              fontSize: 16,
              background: "var(--input-bg)",
              color: "var(--input-text)",
            }}
          />

          <div
            style={{
              marginTop: "auto",
              padding: 14,
              borderRadius: 14,
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              fontSize: 16,
              color: "var(--text)",
            }}
          >
            <strong>{filtered.length}</strong> video entr{filtered.length === 1 ? "y" : "ies"} visible
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--bg-elev)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: 18,
          boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--accent)",
            textTransform: "lowercase",
          }}
        >
          archive entries
        </div>

        {state.loading ? <div style={{ color: "var(--muted)" }}>loading entries…</div> : null}
        {!state.loading && state.error ? <div style={{ color: "#ffb8b8" }}>{state.error}</div> : null}
        {!state.loading && !state.error && !filtered.length ? (
          <div style={{ color: "var(--muted)" }}>no video entries yet.</div>
        ) : null}

        {filtered.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((item) => (
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ color: "var(--text)", fontWeight: 800, fontSize: "1.02rem", lineHeight: 1.15 }}>
                      {item.title}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 14 }}>
                      {item.status} • {item.slug || "no-slug"}{item.featured ? " • featured" : ""}
                    </div>
                    {item.metaText ? (
                      <div style={{ color: "#93b4f0", fontSize: 13, fontWeight: 700 }}>{item.metaText}</div>
                    ) : null}
                    {item.description ? (
                      <div style={{ color: "var(--muted)", lineHeight: 1.5, maxWidth: 880 }}>{item.description}</div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {item.slug ? (
                      <a
                        href={`/dpg-shares/${item.slug}`}
                        style={{
                          ...pillStyle(false),
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        view public
                      </a>
                    ) : null}
                    <button type="button" onClick={() => beginEdit(item)} style={pillStyle(false)}>
                      edit
                    </button>
                    {item.status === "published" ? (
                      <button type="button" onClick={() => unpublish(item)} style={pillStyle(false)} disabled={busy}>
                        unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => beginEdit(item)}
                        style={pillStyle(false)}
                        disabled={busy}
                      >
                        load draft
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
