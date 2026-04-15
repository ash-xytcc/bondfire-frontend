import React from "react";
import { getDpgPublicTheme, useDpgPublicSiteConfig } from "../../lib/dpgPublicSite.js";
import { applyAppVariantToDocument } from "../../lib/appVariant.js";

export default function PublicBulletinPost() {
  const { config } = useDpgPublicSiteConfig();
  const theme = getDpgPublicTheme(config);
  React.useEffect(() => {
    try {
      document.documentElement.dataset.app = "dpg";
      document.body.dataset.app = "dpg";
    } catch {}
    applyAppVariantToDocument();

    const killDarkMode = () => {
      try {
        const nodes = Array.from(document.querySelectorAll("button, a, div"));
        for (const node of nodes) {
          const text = String(node.textContent || "").trim().toLowerCase();
          const style = window.getComputedStyle(node);
          if (text === "dark mode" && style.position === "fixed") {
            node.remove();
          }
        }
      } catch {}
    };

    killDarkMode();
    const t1 = window.setTimeout(killDarkMode, 50);
    const t2 = window.setTimeout(killDarkMode, 300);
    const t3 = window.setTimeout(killDarkMode, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);


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
    <div style={theme.page}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
        <a href="/bulletin" style={theme.link}>← Back to bulletin</a>
        <div style={{ marginTop: 18, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.8, color: "#d7ddd8" }}>
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
        </div>
        <h1 className="dpg-heading" style={{ margin: "10px 0 14px", fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.98, color: "#f3efe8" }}>
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
