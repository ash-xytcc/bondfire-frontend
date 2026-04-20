import React from "react";

async function api(path, opts = {}) {
  const headers = {
    Accept: "application/json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(path, {
    ...opts,
    headers,
    credentials: "include",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
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

const theme = {
  bgElev: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72)",
  border: "rgba(255,255,255,0.08)",
  text: "#f3efe8",
  muted: "#d7ddd8",
  accent: "#93b4f0",
  inputBg: "rgba(255,255,255,0.06)",
  inputText: "#f3efe8",
};

const EMPTY = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  tags: "",
  durationText: "",
  metaText: "",
  featured: false,
};

function btn(primary = false) {
  return {
    border: primary ? "0" : "1px solid var(--border)",
    borderRadius: 999,
    padding: "10px 14px",
    cursor: "pointer",
    background: primary ? "var(--accent)" : "rgba(255,255,255,0.05)",
    color: primary ? "#121715" : "var(--text)",
    fontWeight: 800,
    fontSize: 14,
  };
}

function inputStyle() {
  return {
    width: "100%",
    borderRadius: 12,
    border: "1px solid var(--border)",
    padding: "12px 14px",
    fontSize: 16,
    background: "var(--input-bg)",
    color: "var(--input-text)",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
}

function cardStyle() {
  return {
    border: "1px solid var(--border)",
    borderRadius: 24,
    padding: 20,
    background: "var(--bg-elev)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
  };
}

export default function DpgVideosPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("Loading videos…");
  const [editingId, setEditingId] = React.useState("");
  const [draft, setDraft] = React.useState(EMPTY);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    setStatus("Loading videos…");

    try {
      const res = await api("/api/orgs/dpg/shares", { method: "GET" });

      if (!res.ok) {
        const msg =
          res?.data?.error ||
          res?.data?.detail ||
          res?.data?.message ||
          res?.data?.raw ||
          `HTTP ${res.status}`;
        setItems([]);
        setError(String(msg));
        setStatus("Could not load video records.");
        setLoading(false);
        return;
      }

      const next = Array.isArray(res?.data?.shares) ? res.data.shares : [];
      setItems(next);
      setStatus(`Loaded ${next.length} video entr${next.length === 1 ? "y" : "ies"}.`);
    } catch (e) {
      setItems([]);
      setError(String(e?.message || e));
      setStatus("Runtime error while loading videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setEditingId("");
    setDraft(EMPTY);
  }

  function editItem(item) {
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
    setError("");
    setStatus("Editing existing video entry.");
  }

  async function save(statusValue = "published") {
    const title = String(draft.title || "").trim();
    const videoUrl = String(draft.videoUrl || "").trim();

    if (!title) {
      setError("Title is required.");
      return;
    }
    if (!videoUrl) {
      setError("Video URL is required until the R2 upload phase lands.");
      return;
    }

    setSaving(true);
    setError("");
    setStatus(editingId ? "Saving changes…" : "Creating video entry…");

    const body = {
      ...(editingId ? { id: editingId } : {}),
      title,
      description: String(draft.description || "").trim(),
      videoUrl,
      thumbnailUrl: String(draft.thumbnailUrl || "").trim(),
      tags: String(draft.tags || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      durationText: String(draft.durationText || "").trim(),
      metaText: String(draft.metaText || "").trim(),
      featured: !!draft.featured,
      status: statusValue,
    };

    try {
      const res = await api("/api/orgs/dpg/shares", {
        method: editingId ? "PATCH" : "POST",
        body,
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
      await load();
      setStatus(editingId ? "Video entry updated." : "Video entry created.");
    } catch (e) {
      setError(String(e?.message || e));
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function unpublish(item) {
    setSaving(true);
    setError("");
    setStatus("Unpublishing video entry…");

    try {
      const res = await api("/api/orgs/dpg/shares", {
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
      await load();
      setStatus("Video entry unpublished.");
    } catch (e) {
      setError(String(e?.message || e));
      setStatus("Unpublish failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        "--bg-elev": theme.bgElev,
        "--border": theme.border,
        "--text": theme.text,
        "--muted": theme.muted,
        "--accent": theme.accent,
        "--input-bg": theme.inputBg,
        "--input-text": theme.inputText,
        color: "var(--text)",
        padding: 20,
        display: "grid",
        gap: 20,
      }}
    >
      <div style={cardStyle()}>
        <div style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
          DPG Shares backend
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(2.1rem, 5vw, 4rem)", lineHeight: 0.96 }}>
          videos
        </h1>
        <div style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.58, maxWidth: 900 }}>
          This is the private backend manager for DPG video entries. Phase two keeps the existing shares records,
          moves management fully into the backend, and prepares the page for the R2 upload flow next.
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>status</div>
        <div style={{ color: "var(--muted)", whiteSpace: "pre-wrap" }}>{status}</div>
        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,120,120,0.22)",
              background: "rgba(255,120,120,0.08)",
              color: "#ffb8b8",
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: 20 }}>
        <div style={cardStyle()}>
          <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 14 }}>
            {editingId ? "edit video entry" : "new video entry"}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <input
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="title"
              style={inputStyle()}
            />

            <input
              value={draft.videoUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="video URL"
              style={inputStyle()}
            />

            <input
              value={draft.thumbnailUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="thumbnail URL"
              style={inputStyle()}
            />

            <input
              value={draft.tags}
              onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="tags, comma separated"
              style={inputStyle()}
            />

            <input
              value={draft.durationText}
              onChange={(e) => setDraft((prev) => ({ ...prev, durationText: e.target.value }))}
              placeholder="duration text"
              style={inputStyle()}
            />

            <input
              value={draft.metaText}
              onChange={(e) => setDraft((prev) => ({ ...prev, metaText: e.target.value }))}
              placeholder="meta text"
              style={inputStyle()}
            />

            <textarea
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="description"
              rows={6}
              style={{ ...inputStyle(), resize: "vertical" }}
            />

            <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={!!draft.featured}
                onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))}
              />
              mark as featured
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => save("published")} disabled={saving} style={btn(true)}>
                {saving ? "saving..." : editingId ? "save changes" : "publish entry"}
              </button>

              <button type="button" onClick={() => save("draft")} disabled={saving} style={btn(false)}>
                save as draft
              </button>

              {editingId ? (
                <button type="button" onClick={resetForm} disabled={saving} style={btn(false)}>
                  cancel edit
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div style={cardStyle()}>
          <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 14 }}>archive entries</div>

          {loading ? (
            <div style={{ color: "var(--muted)" }}>loading…</div>
          ) : !items.length ? (
            <div style={{ color: "var(--muted)" }}>no entries found yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(255,255,255,0.04)",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>
                    {item.status} • {item.slug || "no-slug"}{item.featured ? " • featured" : ""}
                  </div>
                  {item.metaText ? (
                    <div style={{ color: "var(--accent)", fontSize: 13 }}>{item.metaText}</div>
                  ) : null}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => editItem(item)} style={btn(false)}>
                      edit
                    </button>
                    {item.status === "published" ? (
                      <button type="button" onClick={() => unpublish(item)} disabled={saving} style={btn(false)}>
                        unpublish
                      </button>
                    ) : null}
                    {item.slug ? (
                      <a
                        href={`/dpg-shares/${item.slug}`}
                        style={{ ...btn(false), textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                      >
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
