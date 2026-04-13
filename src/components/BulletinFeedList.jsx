import React from "react";
import { Link } from "react-router-dom";
import { formatBulletinDate, getBulletinList } from "./BulletinUtils";
import "../styles/bulletin.css";

export default function BulletinFeedList({
  posts,
  heading = "Bulletin",
  subtitle = "News, updates, and statements from the branch.",
}) {
  const items = React.useMemo(() => getBulletinList(posts), [posts]);

  return (
    <section className="bulletin-shell bulletin-stack">
      <header className="bulletin-hero">
        <div className="bulletin-kicker">Red Harbor Bulletin</div>
        <h1 className="bulletin-title">{heading}</h1>
        <p className="bulletin-subtitle">{subtitle}</p>
      </header>

      <div className="bulletin-feed">
        {items.length ? (
          items.map((post) => (
            <Link
              key={post.id || post.slug}
              className="bulletin-feed-item"
              to={`/bulletin/${post.slug}`}
            >
              <div className="bulletin-feed-meta">
                {formatBulletinDate(post.publishedAt)}
              </div>
              <h2 className="bulletin-feed-title">
                {post.title || "Untitled post"}
              </h2>
              {post.excerpt ? (
                <p className="bulletin-feed-excerpt">{post.excerpt}</p>
              ) : null}
            </Link>
          ))
        ) : (
          <p className="bulletin-empty">No bulletin posts have been published yet.</p>
        )}
      </div>
    </section>
  );
}