import React from "react";
import { Link } from "react-router-dom";
import { normalizeBulletinFields, isPublishedBulletin } from "../components/BulletinUtils";

const ORG_SLUG = "red-harbor";

export default function BulletinIndexPage() {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const res = await fetch(`/api/public/bulletin?org=${ORG_SLUG}&limit=20`);
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load bulletin");
        if (!ignore) setPosts(data.posts || []);
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
  }, []);

  const styles = {
    wrap: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px", color: "#f5f0e8" },
    list: { display: "grid", gap: 16 },
    card: {
      display: "block",
      padding: 20,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      textDecoration: "none",
      color: "inherit",
    },
    meta: { fontSize: 12, opacity: 0.68, textTransform: "uppercase", letterSpacing: ".1em" },
  };

  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ opacity: 0.72, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>
          Red Harbor
        </div>
        <h1 style={{ margin: "8px 0 10px" }}>Bulletin</h1>
        <p style={{ maxWidth: 760, lineHeight: 1.7, opacity: 0.9 }}>
          Public statements, branch updates, event notes, and other writing from the branch.
        </p>
      </div>

      {loading ? <div>Loading…</div> : null}
      {error ? <div>{error}</div> : null}

      <div style={styles.list}>
        {posts.map((post) => (
          <Link key={post.id} to={`/bulletin/${post.slug}`} style={styles.card}>
            <div style={styles.meta}>{post.publishedAt || post.updatedAt || ""}</div>
            <h2 style={{ margin: "8px 0 10px" }}>{post.title}</h2>
            <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.9 }}>{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
