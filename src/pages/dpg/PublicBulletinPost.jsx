import React from "react";
import { applyAppVariantToDocument } from "../../lib/appVariant.js";
import { getDpgPublicTheme, useDpgPublicSiteConfig } from "../../lib/dpgPublicSite.js";

export default function PublicBulletinPost() {
  const { config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);

  const slug = React.useMemo(() => {
    const parts = String(window.location.pathname || "/").split("/").filter(Boolean);
    return decodeURIComponent(parts[1] || "");
  }, []);

  const [state, setState] = React.useState({ loading: true, post: null, error: "" });

  React.useEffect(() => {
    try {
      document.documentElement.dataset.app = "dpg";
      document.body.dataset.app = "dpg";
    } catch {}
    applyAppVariantToDocument();
  }, []);

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

  if (state.loading) {
    return (
      <div style={{ ...theme.page, padding: 24, color: "#d7ddd8", fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
        Loading…
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ ...theme.page, padding: 24, color: "crimson", fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
        {state.error}
      </div>
    );
  }

  const post = state.post;
  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
        <a href="/bulletin" style={{ ...theme.link, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>← Back to bulletin</a>
        <div style={{ marginTop: 18, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.8, color: "#d7ddd8" }}>
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
        </div>
        <h1
          className="dpg-heading"
          style={{
            margin: "10px 0 14px",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            lineHeight: 0.98,
            color: "#f3efe8",
            fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
          }}
        >
          {post.title}
        </h1>
        {post.excerpt ? <p style={{ margin: "0 0 24px", lineHeight: 1.7, fontSize: 18, color: "#f3efe8" }}>{post.excerpt}</p> : null}
        <article style={{ ...theme.articleCard, whiteSpace: "pre-wrap", color: "#f3efe8" }}>
          {post.body}
        </article>
      </div>
    </div>
  );
}
