import React from "react";

export default function PublicBulletinPost() {
  const slug = React.useMemo(() => {
    const parts = String(window.location.pathname || "/").split("/").filter(Boolean);
    return decodeURIComponent(parts[1] || "");
  }, []);

  const [state, setState] = React.useState({ loading: true, post: null, error: "" });

  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/posts/${encodeURIComponent(slug)}?org=dpg`, { headers: { Accept: "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (dead) return;
        if (!res.ok || !data?.ok || !data?.post) throw new Error(data?.error || "Post not found");
        setState({ loading: false, post: data.post, error: "" });
      } catch (e) {
        if (dead) return;
        setState({ loading: false, post: null, error: String(e?.message || e) });
      }
    })();
    return () => { dead = true; };
  }, [slug]);

  if (state.loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (state.error) return <div style={{ padding: 24, color: "crimson" }}>{state.error}</div>;

  const post = state.post;
  return (
    <div style={{ minHeight: "100vh", background: "#f7f3ea", color: "#171717" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
        <a href="/bulletin" style={{ color: "#171717", fontWeight: 800, textDecoration: "none" }}>← Back to bulletin</a>
        <div style={{ marginTop: 18, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.68 }}>
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
        </div>
        <h1 className="dpg-heading" style={{ margin: "10px 0 14px", fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.98 }}>{post.title}</h1>
        {post.excerpt ? <p style={{ margin: "0 0 24px", lineHeight: 1.7, fontSize: 18 }}>{post.excerpt}</p> : null}
        <article style={{ border: "1px solid rgba(17,17,17,0.12)", borderRadius: 18, padding: 22, background: "rgba(255,255,255,0.9)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
          {post.body}
        </article>
      </div>
    </div>
  );
}
