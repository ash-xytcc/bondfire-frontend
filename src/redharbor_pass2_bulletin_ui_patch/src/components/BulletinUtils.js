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
}\n