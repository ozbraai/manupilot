create table public.nda_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nda_version text not null,
  typed_name text null,
  accepted_at timestamptz not null default now(),
  ip_address text null,
  user_agent text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index nda_acceptances_user_version_idx
  on public.nda_acceptances (user_id, nda_version);

alter table public.nda_acceptances enable row level security;

create policy "users can view their own nda"
on public.nda_acceptances
for select
to authenticated
using (user_id = auth.uid());

create policy "users can insert their own nda"
on public.nda_acceptances
for insert
to authenticated
with check (user_id = auth.uid());
