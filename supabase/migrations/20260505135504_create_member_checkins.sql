-- Member checkins table for reception / attendance tracking.
-- Supports manual, QR, and reception desk check-ins with status snapshots.

create table if not exists public.member_checkins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete restrict,
  membership_request_id uuid null references public.membership_requests(id) on delete set null,
  checked_in_at timestamptz not null default timezone('utc', now()),
  method text not null default 'manual',
  status_snapshot text not null,
  membership_valid_until date null,
  registered_by_user_id text null,
  registered_by_email text null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Indexes for fast lookups
create index if not exists member_checkins_member_id_idx
  on public.member_checkins(member_id);

create index if not exists member_checkins_checked_in_at_idx
  on public.member_checkins(checked_in_at desc);

create index if not exists member_checkins_member_checked_in_idx
  on public.member_checkins(member_id, checked_in_at desc);

-- Constraints for data integrity
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_checkins_method_check'
      and conrelid = 'public.member_checkins'::regclass
  ) then
    alter table public.member_checkins
      add constraint member_checkins_method_check
      check (method in ('manual', 'qr', 'reception'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_checkins_status_snapshot_check'
      and conrelid = 'public.member_checkins'::regclass
  ) then
    alter table public.member_checkins
      add constraint member_checkins_status_snapshot_check
      check (status_snapshot in ('active', 'expires_today', 'expired', 'paused', 'cancelled', 'former', 'prospect', 'no_membership', 'unknown'));
  end if;
end $$;

-- Row level security for staff access
alter table public.member_checkins enable row level security;

drop policy if exists "Staff can manage member checkins" on public.member_checkins;
create policy "Staff can manage member checkins"
  on public.member_checkins
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
