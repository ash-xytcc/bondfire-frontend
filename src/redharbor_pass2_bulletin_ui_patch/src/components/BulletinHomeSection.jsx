import React from "react";
import { Link } from "react-router-dom";
import "../styles/bulletin.css";
import { formatBulletinDate, getBulletinList } from "./BulletinUtils";

export default function BulletinHomeSection({
  posts,
  title = "Recent updates from the branch",
  viewAllHref = "/bulletin",
}) {
  const items = React.useMemo(() => getBulletinList(posts).slice(0, 3), [posts]);

  if (!items.length) return null;

  return (
    <section className="bulletin-home-block">
      <div className="bulletin-home-header">
        <div>
          <div className="bulletin-kicker">Bulletin</div>
          <h2 className="bulletin-home-title">{title}</h2>
        </div>
        <Link to={viewAllHref}>View all updates</Link>
      </div>

      <div className="bulletin-home-list">
        {items.map((post) => (
          <Link
            key={post.id || post.slug}
            className="bulletin-home-item"
            to={`/bulletin/${post.slug}`}
          >
            <div className="bulletin-home-meta">
              {formatBulletinDate(post.publishedAt)}
            </div>
            <strong>{post.title || "Untitled post"}</strong>
            {post.excerpt ? (
              <p className="bulletin-home-excerpt">{post.excerpt}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}\n