create table if not exists public.marketing_team_members (
  id uuid primary key default gen_random_uuid(),
  site_settings_id integer not null default 1 references public.site_settings (id) on delete cascade,
  name text not null,
  role text not null,
  bio text not null,
  image_url text,
  "order" integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists marketing_team_members_site_settings_order_idx
  on public.marketing_team_members (site_settings_id, "order");

alter table public.marketing_team_members enable row level security;

drop policy if exists "marketing_team_members public read" on public.marketing_team_members;
create policy "marketing_team_members public read"
on public.marketing_team_members
for select
using (true);

drop policy if exists "marketing_team_members auth manage" on public.marketing_team_members;
create policy "marketing_team_members auth manage"
on public.marketing_team_members
for all
to authenticated
using (true)
with check (true);
