import React from "react";
import { applyAppVariantToDocument } from "../../lib/appVariant.js";
import { getDpgPublicTheme, useDpgPublicSiteConfig } from "../../lib/dpgPublicSite.js";

export default function PublicBulletinIndex() {
  const { config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);
  const [state, setState] = React.useState({ loading: true, posts: [], error: "" });

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
        const res = await fetch("/api/public/bulletin?org=dpg&limit=20", { headers: { Accept: "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (dead) return;
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load posts");
        const posts = (Array.isArray(data.posts) ? data.posts : []).map((post) => ({
          ...post,
          publishedAt: post?.publishedAt || post?.published_at || "",
          featureImage: post?.featureImage || post?.feature_image || "",
          feature_image: post?.feature_image || post?.featureImage || "",
        }));
        setState({ loading: false, posts, error: "" });
      } catch (e) {
        if (dead) return;
        setState({ loading: false, posts: [], error: String(e?.message || e) });
      }
    })();
    return () => { dead = true; };
  }, []);

  return (
    <div style={{ ...theme.page, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 64px" }}>
        <a href="/" style={{ ...theme.link, fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)' }}>← Back home</a>
        <h1
          className="dpg-heading"
          style={{
            margin: "16px 0 10px",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            color: "#f3efe8",
            fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
          }}
        >
          {config?.bulletin_title || "Bulletin"}
        </h1>

        {config?.bulletin_intro ? (
          <div style={{ ...theme.card, marginBottom: 16 }}>
            <p style={{ margin: 0, lineHeight: 1.65, color: "#f3efe8" }}>{config.bulletin_intro}</p>
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 16 }}>
          {state.loading ? <div style={{ color: "#d7ddd8" }}>Loading…</div> : null}
          {state.error ? <div style={{ color: "crimson" }}>{state.error}</div> : null}

          {state.posts.map((post) => (
            <a
              key={post.slug}
              href={`/bulletin/${post.slug}`}
              style={{ display: "block", textDecoration: "none", color: "inherit", ...theme.card }}
            >
              <div style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.8, marginBottom: 8, color: "#d7ddd8" }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
              </div>
              <h2
                className="dpg-heading"
                style={{
                  margin: 0,
                  fontSize: 28,
                  color: "#f3efe8",
                  fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
                }}
              >
                {post.title}
              </h2>
              <p style={{ margin: "10px 0 0", lineHeight: 1.6, color: "#f3efe8" }}>{post.excerpt}</p>
            </a>
          ))}

          {!state.loading && !state.posts.length && !state.error ? <div style={{ color: "#d7ddd8" }}>No posts yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
