-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  title           text NOT NULL,
  slug            text UNIQUE NOT NULL,
  excerpt         text,
  content         text NOT NULL DEFAULT '',

  featured_image  text,

  -- SEO
  seo_title       text,
  seo_description text,

  -- FAQ (stored as JSON array of {question, answer})
  faqs            jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Publishing
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','published','scheduled')),
  published_at    timestamptz,
  scheduled_at    timestamptz,

  author_name     text NOT NULL DEFAULT 'Laibcove Team'
);

-- Index for public blog listing (published, ordered by date)
CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON blog_posts (published_at DESC)
  WHERE status = 'published';

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable RLS  (service_role key used in Next.js bypasses RLS automatically)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read published posts" ON blog_posts;
CREATE POLICY "public read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= now());
