import React from "react";
import { applyAppVariantToDocument } from "../../lib/appVariant.js";
import { getDpgPublicTheme, useDpgPublicSiteConfig } from "../../lib/dpgPublicSite.js";

function normalizePost(post = {}) {
  return {
    ...post,
    slug: String(post?.slug || "").trim(),
    title: String(post?.title || "").trim(),
    excerpt: String(post?.excerpt || post?.summary || "").trim(),
    publishedAt: post?.publishedAt || post?.published_at || post?.createdAt || post?.created_at || "",
    featureImage: post?.featureImage || post?.feature_image || "",
  };
}

function extractPosts(data) {
  const raw =
    (Array.isArray(data?.posts) && data.posts) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.results) && data.results) ||
    (Array.isArray(data) && data) ||
    [];

  return raw
    .map(normalizePost)
    .filter((post) => post.slug && post.title);
}

async function fetchBulletinPosts() {
  const attempts = [
    "/api/public/posts?org=dpg",
    "/api/public/posts?org=dpg&limit=20",
    "/api/public/bulletin?org=dpg",
    "/api/public/bulletin?org=dpg&limit=20",
  ];

  let lastError = "Failed to load posts";

  for (const url of attempts) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      const posts = extractPosts(data);

      if (res.ok && (data?.ok !== false) && posts.length) {
        return posts;
      }

      if (res.ok && (data?.ok !== false) && Array.isArray(posts)) {
        return posts;
      }

      lastError = data?.error || `Request failed for ${url}`;
    } catch (e) {
      lastError = String(e?.message || e);
    }
  }

  throw new Error(lastError || "Failed to load posts");
}

function BulletinCard({ post, theme }) {
  const dateText = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "";

  return (
    <a
      href={`/bulletin/${post.slug}`}
      style={{
        display: "grid",
        gap: 14,
        textDecoration: "none",
        color: "inherit",
        ...theme.card,
        borderRadius: 24,
        padding: 22,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
      }}
    >
      {post.featureImage ? (
        <img
          src={post.featureImage}
          alt={post.title}
          style={{
            width: "100%",
            aspectRatio: "16 / 8",
            objectFit: "cover",
            display: "block",
            borderRadius: 18,
          }}
        />
      ) : null}

      <div
        style={{
          fontSize: 11,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "#93b4f0",
          fontWeight: 800,
        }}
      >
        {dateText || "Public note"}
      </div>

      <h2
        className="dpg-heading"
        style={{
          margin: 0,
          fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
          lineHeight: 0.98,
          color: "#f3efe8",
          fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
        }}
      >
        {post.title}
      </h2>

      {post.excerpt ? (
        <p style={{ margin: 0, lineHeight: 1.7, color: "#f3efe8", fontSize: "1.02rem" }}>
          {post.excerpt}
        </p>
      ) : null}

      <div
        style={{
          color: "#d7ddd8",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        Read post →
      </div>
    </a>
  );
}

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
        const posts = await fetchBulletinPosts();
        if (dead) return;
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
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 20px 72px" }}>
        <a
          href="/"
          style={{
            ...theme.link,
            fontFamily: 'var(--dpg-font, "Formulario 1312", Inter, system-ui, Arial, sans-serif)',
            display: "inline-block",
            marginBottom: 18,
          }}
        >
          ← Back home
        </a>

        <header
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 22,
            alignItems: "center",
            marginBottom: 26,
          }}
        >
          <img
            src="/branding/dpg-logo.png"
            alt="Dual Power West"
            style={{
              width: 84,
              height: 84,
              objectFit: "contain",
              filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.22))",
            }}
          />
          <div>
            <div style={{ color: "#d7ddd8", marginBottom: 10, fontSize: 15 }}>
              public updates, logistics, and notes
            </div>
            <h1
              className="dpg-heading"
              style={{
                margin: 0,
                fontSize: "clamp(2.6rem, 6vw, 5.4rem)",
                lineHeight: 0.95,
                color: String(config?.accent_color || "#93b4f0"),
                fontFamily: 'var(--dpg-display-font, "Fancy Shadow", Georgia, serif)',
              }}
            >
              {config?.bulletin_title || "Bulletin"}
            </h1>
          </div>
        </header>

        {config?.bulletin_intro ? (
          <div
            style={{
              ...theme.card,
              marginBottom: 20,
              borderRadius: 24,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)), rgba(10,16,14,0.72)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.68, color: "#f3efe8", fontSize: "1.03rem" }}>
              {config.bulletin_intro}
            </p>
          </div>
        ) : null}

        {state.loading ? (
          <div style={{ color: "#d7ddd8" }}>Loading posts…</div>
        ) : null}

        {state.error ? (
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              background: "rgba(120, 20, 20, 0.14)",
              border: "1px solid rgba(255,120,120,0.18)",
              color: "#ffb8b8",
              marginBottom: 18,
            }}
          >
            {state.error}
          </div>
        ) : null}

        {!state.loading && !state.error && !state.posts.length ? (
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#d7ddd8",
            }}
          >
            No posts yet.
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {state.posts.map((post) => (
            <BulletinCard key={post.slug} post={post} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}
