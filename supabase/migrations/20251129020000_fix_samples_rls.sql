-- Fix RLS policies for sample_qc and sample_photos to be simpler and rely on samples RLS
-- Also add missing DELETE policies

-- Drop existing policies for sample_qc
drop policy if exists "Users can view qc for their samples" on sample_qc;
drop policy if exists "Users can insert qc for their samples" on sample_qc;
drop policy if exists "Users can update qc for their samples" on sample_qc;

-- Drop existing policies for sample_photos
drop policy if exists "Users can view photos for their samples" on sample_photos;
drop policy if exists "Users can insert photos for their samples" on sample_photos;
drop policy if exists "Users can update photos for their samples" on sample_photos;

-- Create new simplified policies
-- We rely on the fact that 'samples' has RLS enabled, so users can only SELECT samples they own.

-- Sample QC
create policy "Users can view qc for their samples"
    on sample_qc for select
    using (exists (select 1 from samples where samples.id = sample_qc.sample_id));

create policy "Users can insert qc for their samples"
    on sample_qc for insert
    with check (exists (select 1 from samples where samples.id = sample_qc.sample_id));

create policy "Users can update qc for their samples"
    on sample_qc for update
    using (exists (select 1 from samples where samples.id = sample_qc.sample_id));

create policy "Users can delete qc for their samples"
    on sample_qc for delete
    using (exists (select 1 from samples where samples.id = sample_qc.sample_id));

-- Sample Photos
create policy "Users can view photos for their samples"
    on sample_photos for select
    using (exists (select 1 from samples where samples.id = sample_photos.sample_id));

create policy "Users can insert photos for their samples"
    on sample_photos for insert
    with check (exists (select 1 from samples where samples.id = sample_photos.sample_id));

create policy "Users can update photos for their samples"
    on sample_photos for update
    using (exists (select 1 from samples where samples.id = sample_photos.sample_id));

create policy "Users can delete photos for their samples"
    on sample_photos for delete
    using (exists (select 1 from samples where samples.id = sample_photos.sample_id));

-- Add missing DELETE policy for samples
create policy "Users can delete samples for their projects"
    on samples for delete
    using (auth.uid() in (select user_id from projects where id = samples.project_id));
