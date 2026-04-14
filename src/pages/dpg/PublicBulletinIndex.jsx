import React from "react";

export default function PublicBulletinIndex() {
  const [state, setState] = React.useState({ loading: true, posts: [], error: "" });

  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const res = await fetch("/api/public/posts?org=dpg", { headers: { Accept: "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (dead) return;
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load posts");
        setState({ loading: false, posts: Array.isArray(data.posts) ? data.posts : [], error: "" });
      } catch (e) {
        if (dead) return;
        setState({ loading: false, posts: [], error: String(e?.message || e) });
      }
    })();
    return () => { dead = true; };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f3ea", color: "#171717" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 64px" }}>
        <a href="/" style={{ color: "#171717", fontWeight: 800, textDecoration: "none" }}>← Back home</a>
        <h1 className="dpg-heading" style={{ margin: "16px 0 10px", fontSize: "clamp(2rem, 5vw, 4rem)" }}>Bulletin</h1>
        <div style={{ display: "grid", gap: 16 }}>
          {state.loading ? <div>Loading…</div> : null}
          {state.error ? <div style={{ color: "crimson" }}>{state.error}</div> : null}
          {state.posts.map((post) => (
            <a key={post.slug} href={`/bulletin/${post.slug}`} style={{ display: "block", textDecoration: "none", color: "#171717", border: "1px solid rgba(17,17,17,0.12)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,0.88)" }}>
              <div style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.68, marginBottom: 8 }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
              </div>
              <h2 className="dpg-heading" style={{ margin: 0, fontSize: 28 }}>{post.title}</h2>
              <p style={{ margin: "10px 0 0", lineHeight: 1.6 }}>{post.excerpt}</p>
            </a>
          ))}
          {!state.loading && !state.posts.length && !state.error ? <div>No posts yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
