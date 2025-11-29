-- Create samples table
create type sample_status as enum ('requested', 'in_production', 'shipped', 'received', 'approved', 'revision_required');

create table if not exists samples (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade not null,
    sample_number text not null, -- e.g. "T1", "T2"
    status sample_status default 'requested' not null,
    notes text,
    requested_at timestamptz default now(),
    received_at timestamptz,
    evaluated_at timestamptz,
    created_at timestamptz default now()
);

-- Create sample_qc table
create type qc_result as enum ('pass', 'fail', 'not_checked');

create table if not exists sample_qc (
    id uuid primary key default gen_random_uuid(),
    sample_id uuid references samples(id) on delete cascade not null,
    criteria text not null,
    result qc_result default 'not_checked' not null,
    comment text,
    created_at timestamptz default now()
);

-- Create sample_photos table
create table if not exists sample_photos (
    id uuid primary key default gen_random_uuid(),
    sample_id uuid references samples(id) on delete cascade not null,
    file_url text not null,
    caption text,
    ai_analysis jsonb, -- Store AI feedback here
    created_at timestamptz default now()
);

-- Enable RLS
alter table samples enable row level security;
alter table sample_qc enable row level security;
alter table sample_photos enable row level security;

-- Policies (allow all authenticated users for now, can be refined later)
create policy "Users can view samples for their projects"
    on samples for select
    using (auth.uid() in (select user_id from projects where id = samples.project_id));

create policy "Users can insert samples for their projects"
    on samples for insert
    with check (auth.uid() in (select user_id from projects where id = samples.project_id));

create policy "Users can update samples for their projects"
    on samples for update
    using (auth.uid() in (select user_id from projects where id = samples.project_id));

create policy "Users can view qc for their samples"
    on sample_qc for select
    using (exists (select 1 from samples where samples.id = sample_qc.sample_id and auth.uid() in (select user_id from projects where id = samples.project_id)));

create policy "Users can insert qc for their samples"
    on sample_qc for insert
    with check (exists (select 1 from samples where samples.id = sample_qc.sample_id and auth.uid() in (select user_id from projects where id = samples.project_id)));

create policy "Users can update qc for their samples"
    on sample_qc for update
    using (exists (select 1 from samples where samples.id = sample_qc.sample_id and auth.uid() in (select user_id from projects where id = samples.project_id)));

create policy "Users can view photos for their samples"
    on sample_photos for select
    using (exists (select 1 from samples where samples.id = sample_photos.sample_id and auth.uid() in (select user_id from projects where id = samples.project_id)));

create policy "Users can insert photos for their samples"
    on sample_photos for insert
    with check (exists (select 1 from samples where samples.id = sample_photos.sample_id and auth.uid() in (select user_id from projects where id = samples.project_id)));

create policy "Users can update photos for their samples"
    on sample_photos for update
    using (exists (select 1 from samples where samples.id = sample_photos.sample_id and auth.uid() in (select user_id from projects where id = samples.project_id)));
