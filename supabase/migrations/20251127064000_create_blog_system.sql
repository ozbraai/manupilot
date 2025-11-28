-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    excerpt TEXT,
    content_markdown TEXT NOT NULL,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    canonical_url TEXT,
    og_image_url TEXT,
    read_time_minutes INT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    author_email TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id_status_created_at ON blog_comments(post_id, status, created_at);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_posts_updated_at();

CREATE OR REPLACE FUNCTION update_blog_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_comments_updated_at
BEFORE UPDATE ON blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_blog_comments_updated_at();

-- RLS Policies

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- blog_posts policies

-- SELECT: Public/Auth can see published posts
CREATE POLICY "Public can view published posts"
ON blog_posts FOR SELECT
USING (
    (status = 'published' AND published_at <= NOW())
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- INSERT/UPDATE/DELETE: Admin only
CREATE POLICY "Admins can insert posts"
ON blog_posts FOR INSERT
WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can update posts"
ON blog_posts FOR UPDATE
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can delete posts"
ON blog_posts FOR DELETE
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- blog_comments policies

-- SELECT: Anyone can see approved comments, Admins see all
CREATE POLICY "Public can view approved comments"
ON blog_comments FOR SELECT
USING (
    status = 'approved'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- INSERT: Authenticated users can insert pending comments
CREATE POLICY "Authenticated users can insert comments"
ON blog_comments FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND status = 'pending'
);

-- INSERT: Admins can insert approved comments (or any status)
CREATE POLICY "Admins can insert comments"
ON blog_comments FOR INSERT
WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- UPDATE/DELETE: Admin only
CREATE POLICY "Admins can update comments"
ON blog_comments FOR UPDATE
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can delete comments"
ON blog_comments FOR DELETE
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
