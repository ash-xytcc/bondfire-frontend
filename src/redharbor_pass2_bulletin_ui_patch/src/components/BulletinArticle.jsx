import React from "react";
import "../styles/bulletin.css";
import { formatBulletinDate, normalizeBulletinPost } from "./BulletinUtils";

function renderBody(body) {
  if (!body) return null;
  const chunks = String(body)
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return chunks.map((chunk, idx) => <p key={idx}>{chunk}</p>);
}

export default function BulletinArticle({ post }) {
  const item = normalizeBulletinPost(post);

  return (
    <article className="bulletin-article">
      <header>
        <div className="bulletin-article-meta">
          {formatBulletinDate(item.publishedAt)}
          {item.author ? ` • ${item.author}` : ""}
        </div>
        <h1>{item.title || "Untitled post"}</h1>
        {item.excerpt ? <p className="excerpt">{item.excerpt}</p> : null}
      </header>

      <div className="bulletin-article-body">{renderBody(item.body)}</div>
    </article>
  );
}\n