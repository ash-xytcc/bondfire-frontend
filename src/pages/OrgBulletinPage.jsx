import React from "react";
import { useParams } from "react-router-dom";
import BulletinEditor from "../components/BulletinEditor";
import { normalizeBulletinPost } from "../components/BulletinUtils";

const EMPTY_POST = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  status: "draft",
};

async function fetchJson(url, options) {
  const safeOptions = options || {};
  const safeHeaders = (safeOptions?.headers) || {};

  const res = await fetch(url, {
    credentials: "include",
    ...safeOptions,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...safeHeaders,
    },
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.message || data?.error || "";
    } catch {}
    throw new Error(detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export default function OrgBulletinPage() {
  const { orgId } = useParams();
  const [posts, setPosts] = React.useState([]);
  const [draft, setDraft] = React.useState(EMPTY_POST);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadPosts = React.useCallback(async () => {
    const data = await fetchJson(`/api/orgs/${orgId}/bulletin`);
    const nextPosts = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];
    setPosts(nextPosts);
    return nextPosts;
  }, [orgId]);

  React.useEffect(() => {
    let live = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const nextPosts = await loadPosts();
        if (!live) return;
        setDraft(normalizeBulletinPost(nextPosts[0] || EMPTY_POST));
      } catch (err) {
        if (live) setError(err?.message || "Failed to load bulletin editor");
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [loadPosts]);

  const saveWithStatus = React.useCallback(async (status) => {
    const current = normalizeBulletinPost(draft);
    const isPublish = status === "published";
    const setBusy = isPublish ? setPublishing : setSaving;

    setBusy(true);
    setError("");

    try {
      const method = current.id ? "PUT" : "POST";
      const endpoint = current.id
        ? `/api/orgs/${orgId}/bulletin/${current.id}`
        : `/api/orgs/${orgId}/bulletin`;

      const data = await fetchJson(endpoint, {
        method,
        body: JSON.stringify({
          ...current,
          status,
        }),
      });

      const saved = normalizeBulletinPost(data?.post || data);
      setDraft(saved.id || saved.slug ? saved : current);
      await loadPosts();
    } catch (err) {
      setError(err?.message || "Failed to save bulletin post");
    } finally {
      setBusy(false);
    }
  }, [draft, loadPosts, orgId]);

  if (loading) return <div className="bulletin-admin">Loading bulletin editor…</div>;

  return (
    <>
      {error ? (
        <div className="bulletin-admin" style={{ paddingBottom: 0 }}>
          <div className="bulletin-panel">
            <div className="bulletin-panel-body">Warning: {error}</div>
          </div>
        </div>
      ) : null}

      <BulletinEditor
        posts={posts}
        value={draft}
        saving={saving}
        publishing={publishing}
        onChange={setDraft}
        onSelectPost={(post) => setDraft(normalizeBulletinPost(post))}
        onNewPost={() => setDraft(EMPTY_POST)}
        onSaveDraft={() => saveWithStatus("draft")}
        onPublish={() => saveWithStatus("published")}
      />
    </>
  );
}