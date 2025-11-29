-- Fix storage policies for project-images bucket

-- Drop existing policies to be safe
drop policy if exists "Public Access for project images" on storage.objects;
drop policy if exists "Authenticated users can upload project images" on storage.objects;
drop policy if exists "Users can update their own project images" on storage.objects;
drop policy if exists "Users can delete their own project images" on storage.objects;

-- Re-create policies
-- 1. Public can view
create policy "Public Access for project images"
on storage.objects for select
using (bucket_id = 'project-images');

-- 2. Authenticated users can upload
-- We simplify this to just check for authentication and bucket_id
create policy "Authenticated users can upload project images"
on storage.objects for insert
with check (
  bucket_id = 'project-images' 
  and auth.role() = 'authenticated'
);

-- 3. Users can update their own images (owner check)
create policy "Users can update their own project images"
on storage.objects for update
using (
  bucket_id = 'project-images' 
  and auth.uid() = owner
);

-- 4. Users can delete their own images (owner check)
create policy "Users can delete their own project images"
on storage.objects for delete
using (
  bucket_id = 'project-images' 
  and auth.uid() = owner
);
