import React from "react";
import "../styles/bulletin.css";
import { formatBulletinDate, getBulletinList, normalizeBulletinPost } from "./BulletinUtils";

const EMPTY_POST = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  status: "draft",
};

export default function BulletinEditor({
  posts,
  value,
  saving = false,
  publishing = false,
  onChange,
  onSelectPost,
  onNewPost,
  onSaveDraft,
  onPublish,
}) {
  const list = React.useMemo(() => getBulletinList(posts), [posts]);
  const current = normalizeBulletinPost(value?.id || value?.slug ? value : EMPTY_POST);

  return (
    <section className="bulletin-admin">
      <div className="bulletin-editor-header">
        <div className="bulletin-kicker">Branch bulletin</div>
        <h1>Write an update</h1>
        <p className="bulletin-editor-note">
          Draft statements, meeting notices, and public updates here. This is a writing desk,
          not a filing cabinet, which is more than many internal tools can claim.
        </p>
      </div>

      <div className="bulletin-admin-layout">
        <aside className="bulletin-panel">
          <div className="bulletin-panel-header">
            <h2>Posts</h2>
          </div>

          <div className="bulletin-post-list">
            <button className="bulletin-post-button" type="button" onClick={onNewPost}>
              <div className="bulletin-post-title-row">
                <strong className="bulletin-post-title">New post</strong>
              </div>
              <div className="bulletin-post-meta">Start a blank draft</div>
            </button>

            {list.map((post) => {
              const active =
                (current.id && post.id === current.id) ||
                (!current.id && current.slug && post.slug === current.slug);

              return (
                <button
                  key={post.id || post.slug}
                  className={`bulletin-post-button${active ? " is-active" : ""}`}
                  type="button"
                  onClick={() => onSelectPost(post)}
                >
                  <div className="bulletin-post-title-row">
                    <strong className="bulletin-post-title">{post.title || "Untitled post"}</strong>
                    <span className={`bulletin-status status-${post.status || "draft"}`}>
                      {post.status || "draft"}
                    </span>
                  </div>
                  <div className="bulletin-post-meta">
                    {formatBulletinDate(post.publishedAt || post.updatedAt || post.createdAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="bulletin-panel">
          <div className="bulletin-panel-body">
            <form
              className="bulletin-form"
              onSubmit={(event) => {
                event.preventDefault();
                onSaveDraft?.();
              }}
            >
              <div className="bulletin-field">
                <label htmlFor="bulletin-title">Title</label>
                <input
                  id="bulletin-title"
                  className="bulletin-input title"
                  value={current.title}
                  onChange={(event) => onChange?.({ ...current, title: event.target.value })}
                  placeholder="Write the headline"
                />
              </div>

              <div className="bulletin-field">
                <label htmlFor="bulletin-excerpt">Excerpt</label>
                <textarea
                  id="bulletin-excerpt"
                  className="bulletin-textarea excerpt"
                  value={current.excerpt}
                  onChange={(event) => onChange?.({ ...current, excerpt: event.target.value })}
                  placeholder="Optional short summary for the public feed"
                />
              </div>

              <div className="bulletin-field">
                <label htmlFor="bulletin-body">Body</label>
                <textarea
                  id="bulletin-body"
                  className="bulletin-textarea body"
                  value={current.body}
                  onChange={(event) => onChange?.({ ...current, body: event.target.value })}
                  placeholder="Write the post here"
                />
              </div>

              {current.slug ? (
                <div className="bulletin-slug">Slug: {current.slug}</div>
              ) : null}

              <div className="bulletin-actions">
                <button className="bulletin-btn" type="submit" disabled={saving || publishing}>
                  {saving ? "Saving…" : "Save Draft"}
                </button>
                <button
                  className="bulletin-btn primary"
                  type="button"
                  onClick={onPublish}
                  disabled={saving || publishing}
                >
                  {publishing ? "Publishing…" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </section>
  );
}\n