export function formatBulletinDate(value) {
  if (!value) return "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Undated";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function bulletinPublishedAt(post) {
  return (
    post?.published_at ||
    post?.publishedAt ||
    post?.updated_at ||
    post?.updatedAt ||
    post?.created_at ||
    post?.createdAt ||
    null
  );
}

export function normalizeBulletinPost(post = {}) {
  return {
    id: post.id ?? "",
    slug: post.slug ?? "",
    title: post.title ?? "",
    excerpt: post.excerpt ?? "",
    body: post.body ?? "",
    status: post.status ?? "draft",
    author: post.author ?? post.author_name ?? post.authorName ?? "",
    publishedAt: bulletinPublishedAt(post),
    updatedAt: post.updated_at ?? post.updatedAt ?? null,
    createdAt: post.created_at ?? post.createdAt ?? null,
  };
}

export function getBulletinList(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeBulletinPost);
  if (Array.isArray(payload?.items)) return payload.items.map(normalizeBulletinPost);
  if (Array.isArray(payload?.posts)) return payload.posts.map(normalizeBulletinPost);
  if (Array.isArray(payload?.results)) return payload.results.map(normalizeBulletinPost);
  return [];
}

export function normalizeBulletinFields(input = {}) {
  const rawStatus =
    input?.bulletinStatus ??
    input?.bulletin_status ??
    input?.status ??
    "";

  const normalizedStatus =
    rawStatus === true
      ? "published"
      : rawStatus === false
      ? "draft"
      : String(rawStatus || "").toLowerCase();

  const bulletinSlug =
    input?.bulletinSlug ??
    input?.bulletin_slug ??
    "";

  const bulletinExcerpt =
    input?.bulletinExcerpt ??
    input?.bulletin_excerpt ??
    "";

  const bulletinPublishedAt =
    input?.bulletinPublishedAt ??
    input?.bulletin_published_at ??
    input?.publishedAt ??
    input?.published_at ??
    "";

  return {
    ...input,
    bulletinSlug,
    bulletin_slug: bulletinSlug,
    bulletinExcerpt,
    bulletin_excerpt: bulletinExcerpt,
    bulletinPublishedAt,
    bulletin_published_at: bulletinPublishedAt,
    bulletinStatus: normalizedStatus,
    bulletin_status: normalizedStatus,
  };
}

export function isPublishedBulletin(input = {}) {
  return normalizeBulletinFields(input).bulletinStatus === "published";
}

export function buildBulletinPayload(input = {}) {
  const n = normalizeBulletinFields(input);
  return {
    ...input,
    bulletinSlug: n.bulletinSlug,
    bulletin_slug: n.bulletinSlug,
    bulletinExcerpt: n.bulletinExcerpt,
    bulletin_excerpt: n.bulletinExcerpt,
    bulletinPublishedAt: n.bulletinPublishedAt,
    bulletin_published_at: n.bulletinPublishedAt,
    bulletinStatus: n.bulletinStatus,
    bulletin_status: n.bulletinStatus,
  };
}
