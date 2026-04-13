import React from "react";
import BulletinFeedList from "../components/BulletinFeedList";

async function fetchJson(url, options) {
  const safeOptions = options || {};
  const safeHeaders = (safeOptions?.headers) || {};

  const res = await fetch(url, {
    credentials: "include",
    ...safeOptions,
    headers: {
      Accept: "application/json",
      ...safeHeaders,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export default function BulletinPublicPage() {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let live = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchJson("/api/bulletin");
        if (live) setPosts(data);
      } catch (err) {
        if (live) setError(err?.message || "Failed to load bulletin");
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  if (loading) return <div className="bulletin-shell">Loading bulletin…</div>;
  if (error) return <div className="bulletin-shell">Failed to load bulletin. {error}</div>;

  return <BulletinFeedList posts={posts} />;
}