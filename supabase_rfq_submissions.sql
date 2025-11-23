-- Create the rfq_submissions table
create table public.rfq_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'draft'::text, -- 'draft', 'submitted', 'in_review', 'completed'
  rfq_data jsonb default '{}'::jsonb,
  
  -- Optional: Add constraints if needed
  constraint status_check check (status in ('draft', 'submitted', 'in_review', 'completed'))
);

-- Enable Row Level Security (RLS)
alter table public.rfq_submissions enable row level security;

-- Create Policy: Users can insert their own RFQ submissions
create policy "Users can insert their own RFQ submissions"
on public.rfq_submissions for insert
with check (auth.uid() = user_id);

-- Create Policy: Users can view their own RFQ submissions
create policy "Users can view their own RFQ submissions"
on public.rfq_submissions for select
using (auth.uid() = user_id);

-- Create Policy: Users can update their own RFQ submissions
create policy "Users can update their own RFQ submissions"
on public.rfq_submissions for update
using (auth.uid() = user_id);

-- Create Policy: Users can delete their own RFQ submissions
create policy "Users can delete their own RFQ submissions"
on public.rfq_submissions for delete
using (auth.uid() = user_id);
