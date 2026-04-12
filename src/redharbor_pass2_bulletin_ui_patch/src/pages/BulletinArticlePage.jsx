import React from "react";
import { useParams } from "react-router-dom";
import BulletinArticle from "../components/BulletinArticle";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
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
        const data = await fetchJson(`/api/bulletin/${slug}`);
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

  if (loading) {
    return <div className="bulletin-shell">Loading article…</div>;
  }

  if (error || !post) {
    return <div className="bulletin-shell">Unable to load article. {error}</div>;
  }

  return <BulletinArticle post={post} />;
}\n