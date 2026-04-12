ALTER TABLE bulletin_posts ADD COLUMN slug TEXT NOT NULL DEFAULT '';
ALTER TABLE bulletin_posts ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE bulletin_posts ADD COLUMN excerpt TEXT NOT NULL DEFAULT '';
ALTER TABLE bulletin_posts ADD COLUMN body TEXT NOT NULL DEFAULT '';
ALTER TABLE bulletin_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE bulletin_posts ADD COLUMN author_id TEXT;
ALTER TABLE bulletin_posts ADD COLUMN author_name TEXT;
ALTER TABLE bulletin_posts ADD COLUMN published_at TEXT;
ALTER TABLE bulletin_posts ADD COLUMN created_at TEXT;
ALTER TABLE bulletin_posts ADD COLUMN updated_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bulletin_posts_org_slug
ON bulletin_posts(org_id, slug);

CREATE INDEX IF NOT EXISTS idx_bulletin_posts_org_status_published
ON bulletin_posts(org_id, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulletin_posts_org_updated
ON bulletin_posts(org_id, updated_at DESC);
