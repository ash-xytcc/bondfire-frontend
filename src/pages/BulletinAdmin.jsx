import React from "react";
import { Link, useParams } from "react-router-dom";

const emptyForm = {
  id: null,
  title: "",
  excerpt: "",
  body: "",
  status: "draft",
};

export default function BulletinAdmin() {
  const { orgId } = useParams();
  const [posts, setPosts] = React.useState([]);
  const [form, setForm] = React.useState(emptyForm);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/orgs/${orgId}/bulletin`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load posts");
      setPosts(data.posts || []);
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [orgId]);

  function startNew() {
    setForm(emptyForm);
    setMessage("");
  }

  function editPost(post) {
    setForm({
      id: post.id,
      title: post.title || "",
      excerpt: post.excerpt || "",
      body: post.body || "",
      status: post.status || "draft",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id
        ? `/api/orgs/${orgId}/bulletin/${form.id}`
        : `/api/orgs/${orgId}/bulletin`;

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.message || "Save failed");

      setMessage(form.id ? "Post updated." : "Post created.");
      setForm({
        id: data.post.id,
        title: data.post.title,
        excerpt: data.post.excerpt,
        body: data.post.body,
        status: data.post.status,
      });
      await load();
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function removePost(post) {
    const ok = window.confirm(`Delete "${post.title}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/orgs/${orgId}/bulletin/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.message || "Delete failed");
      if (form.id === post.id) setForm(emptyForm);
      await load();
      setMessage("Post deleted.");
    } catch (err) {
      setMessage(String(err.message || err));
    }
  }

  const styles = {
    wrap: { padding: 16, display: "grid", gap: 16 },
    grid: { display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)" },
    card: {
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      borderRadius: 16,
      padding: 16,
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.2)",
      color: "#fff",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      minHeight: 320,
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.2)",
      color: "#fff",
      boxSizing: "border-box",
      resize: "vertical",
      fontFamily: "inherit",
      lineHeight: 1.6,
    },
    row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    btn: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      cursor: "pointer",
    },
    danger: {
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid rgba(255,80,80,0.25)",
      background: "rgba(255,80,80,0.12)",
      color: "#fff",
      cursor: "pointer",
    },
    list: { display: "grid", gap: 12 },
    post: {
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14,
      padding: 14,
      background: "rgba(255,255,255,0.03)",
    },
    meta: { fontSize: 12, opacity: 0.72, textTransform: "uppercase", letterSpacing: ".08em" },
    muted: { opacity: 0.65, fontSize: 14 },
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        <h1 style={{ margin: 0 }}>Bulletin Editor</h1>
        <Link to={`/org/${orgId}`} style={{ opacity: 0.8 }}>Back to Branch Board</Link>
        <Link to="/bulletin" style={{ opacity: 0.8 }}>View public bulletin</Link>
      </div>

      {message ? <div style={styles.card}>{message}</div> : null}

      <div style={styles.grid}>
        <form onSubmit={save} style={styles.card}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              <div style={{ marginBottom: 6 }}>Title</div>
              <input
                style={styles.input}
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="Post title"
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Excerpt</div>
              <input
                style={styles.input}
                value={form.excerpt}
                onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
                placeholder="Optional short summary"
              />
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Status</div>
              <select
                style={styles.input}
                value={form.status}
                onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: 6 }}>Body</div>
              <textarea
                style={styles.textarea}
                value={form.body}
                onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
                placeholder="Write the article here."
              />
            </label>

            <div style={styles.row}>
              <button type="submit" style={styles.btn} disabled={saving}>
                {saving ? "Saving..." : form.id ? "Update Post" : "Create Post"}
              </button>
              <button type="button" style={styles.btn} onClick={startNew}>
                New Post
              </button>
            </div>
          </div>
        </form>

        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Posts</h2>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div style={styles.list}>
              {posts.map((post) => {
                const isPublished = String(post.status || "").toLowerCase() === "published";
                return (
                  <div key={post.id} style={styles.post}>
                    <div style={styles.meta}>
                      {post.status} · {post.publishedAt || post.updatedAt || post.createdAt || ""}
                    </div>
                    <h3 style={{ margin: "6px 0 8px" }}>{post.title}</h3>
                    <p style={{ marginTop: 0, opacity: 0.86 }}>{post.excerpt}</p>
                    <div style={styles.row}>
                      <button type="button" style={styles.btn} onClick={() => editPost(post)}>
                        Edit
                      </button>

                      {post.slug && isPublished ? (
                        <Link to={`/bulletin/${post.slug}`} style={{ opacity: 0.85 }}>
                          Public page
                        </Link>
                      ) : (
                        <span style={styles.muted}>
                          Preview unavailable until published
                        </span>
                      )}

                      <button type="button" style={styles.danger} onClick={() => removePost(post)}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {!posts.length ? <div>No posts yet.</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
