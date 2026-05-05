-- Gym Phase 1 legacy operational fields for member profiles, plans, and internal notes.

alter table public.member_profiles
  add column if not exists external_code text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists address text,
  add column if not exists district_or_urbanization text,
  add column if not exists occupation text,
  add column if not exists profile_completed boolean not null default false,
  add column if not exists preferred_schedule text,
  add column if not exists legacy_notes text;

update public.member_profiles
set external_code = coalesce(nullif(trim(member_number), ''), id::text)
where external_code is null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_status_check'
      and conrelid = 'public.member_profiles'::regclass
  ) then
    alter table public.member_profiles
      drop constraint member_profiles_status_check;
  end if;

  alter table public.member_profiles
    add constraint member_profiles_status_check
    check (status in ('prospect', 'active', 'paused', 'cancelled', 'former', 'expired', 'frozen'));
end $$;

alter table public.member_profiles
  alter column external_code set not null;

create unique index if not exists member_profiles_external_code_idx
  on public.member_profiles(external_code);

create index if not exists member_profiles_gender_idx
  on public.member_profiles(gender);

create index if not exists member_profiles_district_idx
  on public.member_profiles(district_or_urbanization);

alter table public.membership_plans
  add column if not exists code text,
  add column if not exists is_freezable boolean not null default false,
  add column if not exists max_freeze_days integer not null default 0,
  add column if not exists bonus_days integer not null default 0;

update public.membership_plans
set code = slug
where code is null;

update public.membership_plans
set code = case slug
  when 'base-30d' then 'PM-1M'
  when 'fuerza-30d' then 'PF-1M'
  when 'elite-30d' then 'PE-1M'
  else code
end
where slug in ('base-30d', 'fuerza-30d', 'elite-30d');

alter table public.membership_plans
  alter column code set not null;

create unique index if not exists membership_plans_code_idx
  on public.membership_plans(code);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'membership_plans_max_freeze_days_check'
      and conrelid = 'public.membership_plans'::regclass
  ) then
    alter table public.membership_plans
      add constraint membership_plans_max_freeze_days_check
      check (max_freeze_days >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'membership_plans_bonus_days_check'
      and conrelid = 'public.membership_plans'::regclass
  ) then
    alter table public.membership_plans
      add constraint membership_plans_bonus_days_check
      check (bonus_days >= 0);
  end if;
end $$;

create table if not exists public.member_notes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  content text not null,
  created_by_user_id text,
  created_by_email text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists member_notes_member_created_idx
  on public.member_notes(member_id, created_at desc);

alter table public.member_notes enable row level security;

drop policy if exists "Staff can manage member notes" on public.member_notes;
create policy "Staff can manage member notes"
  on public.member_notes
  for all
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role in ('admin', 'trainer', 'superadmin')
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role in ('admin', 'trainer', 'superadmin')
    )
  );

create table if not exists public.membership_request_notes (
  id uuid primary key default gen_random_uuid(),
  membership_request_id uuid not null references public.membership_requests(id) on delete cascade,
  content text not null,
  created_by_user_id text,
  created_by_email text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists membership_request_notes_request_created_idx
  on public.membership_request_notes(membership_request_id, created_at desc);

alter table public.membership_request_notes enable row level security;

drop policy if exists "Staff can manage membership request notes" on public.membership_request_notes;
create policy "Staff can manage membership request notes"
  on public.membership_request_notes
  for all
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role in ('admin', 'trainer', 'superadmin')
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role in ('admin', 'trainer', 'superadmin')
    )
  );
