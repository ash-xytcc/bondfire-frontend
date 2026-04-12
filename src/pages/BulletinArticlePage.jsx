import React from "react";
import { Link, useParams } from "react-router-dom";

const ORG_SLUG = "red-harbor";

function renderParagraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default function BulletinArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const res = await fetch(`/api/public/bulletin/${encodeURIComponent(slug)}?org=${ORG_SLUG}`);
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load post");
        if (!ignore) setPost(data.post || null);
      } catch (err) {
        if (!ignore) setError(String(err.message || err));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const styles = {
    wrap: { maxWidth: 900, margin: "0 auto", padding: "32px 20px", color: "#f5f0e8" },
    article: {
      padding: 24,
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
    },
    meta: { fontSize: 12, opacity: 0.68, textTransform: "uppercase", letterSpacing: ".1em" },
    p: { lineHeight: 1.85, fontSize: "1.04rem", margin: "0 0 16px", maxWidth: "72ch" },
  };

  if (loading) return <div style={styles.wrap}>Loading…</div>;
  if (error) return <div style={styles.wrap}>{error}</div>;
  if (!post) return <div style={styles.wrap}>Post not found.</div>;

  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 18 }}>
        <Link to="/bulletin">← Back to bulletin</Link>
      </div>

      <article style={styles.article}>
        <div style={styles.meta}>{post.publishedAt || post.updatedAt || ""}</div>
        <h1 style={{ margin: "10px 0 18px", lineHeight: 1.02 }}>{post.title}</h1>

        {renderParagraphs(post.body).map((p, i) => (
          <p key={i} style={styles.p}>{p}</p>
        ))}
      </article>
    </div>
  );
}
