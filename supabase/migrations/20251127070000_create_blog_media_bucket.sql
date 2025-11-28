-- Create a storage bucket for blog media
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public can view files
CREATE POLICY "Public can view blog media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-media' );

-- Policy: Admins can upload files
CREATE POLICY "Admins can upload blog media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'blog-media'
    AND (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- Policy: Admins can update files
CREATE POLICY "Admins can update blog media"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'blog-media'
    AND (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- Policy: Admins can delete files
CREATE POLICY "Admins can delete blog media"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'blog-media'
    AND (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);
