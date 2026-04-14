import React from "react";
import BulletinFeedList from "../components/BulletinFeedList";
import { normalizeBulletinFields, isPublishedBulletin } from "../components/BulletinUtils";

const ORG_SLUG = "red-harbor";

async function fetchJson(url, options) {
  const safeOptions = options || {};
  const safeHeaders = safeOptions.headers || {};

  const res = await fetch(url, {
    credentials: "include",
    ...safeOptions,
    headers: {
      Accept: "application/json",
      ...safeHeaders,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (typeof data === "object" && data && data.ok === false)) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
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
        const data = await fetchJson(`/api/public/bulletin?org=${ORG_SLUG}&limit=20`);
        if (live) setPosts(data?.posts || []);
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

  return (
    <BulletinFeedList
      posts={posts}
      heading="Bulletin"
      subtitle="Public statements, branch updates, event notes, and other writing from the branch."
    />
  );
}
