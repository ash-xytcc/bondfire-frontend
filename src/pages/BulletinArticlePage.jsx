import React from "react";
import { useParams } from "react-router-dom";
import BulletinArticle from "../components/BulletinArticle";

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

async function loadPublicBulletinArticle(slug) {
  const candidates = [
    `/api/public/bulletin/${slug}?org=${ORG_SLUG}`,
    `/api/public/bulletin/${slug}`,
  ];

  for (const url of candidates) {
    try {
      const data = await fetchJson(url);
      if (data?.post) return data.post;
      if (data?.slug || data?.title) return data;
    } catch {}
  }

  const listData = await fetchJson(`/api/public/bulletin?org=${ORG_SLUG}&limit=50`);
  const posts = listData?.posts || [];
  const found = posts.find((p) => p.slug === slug);
  if (!found) throw new Error("Article not found");
  return found;
}

export default function BulletinArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let live = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await loadPublicBulletinArticle(slug);
        if (live) setPost(data);
      } catch (err) {
        if (live) setError(err?.message || "Failed to load article");
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [slug]);

  if (loading) return <div className="bulletin-shell">Loading article…</div>;
  if (error || !post) return <div className="bulletin-shell">Unable to load article. {error}</div>;

  return <BulletinArticle post={post} />;
}
