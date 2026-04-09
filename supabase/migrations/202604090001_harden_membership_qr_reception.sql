alter table public.member_profiles
  add column if not exists membership_qr_token uuid not null default gen_random_uuid();

create unique index if not exists member_profiles_membership_qr_token_idx
  on public.member_profiles(membership_qr_token);

create index if not exists membership_requests_member_created_idx
  on public.membership_requests(member_id, created_at desc);

create table if not exists public.membership_qr_scan_events (
  id uuid primary key default gen_random_uuid(),
  scanned_at timestamptz not null default timezone('utc', now()),
  scanned_value_hash text not null,
  normalized_token text,
  result_code text not null,
  can_enter boolean not null default false,
  member_id uuid references public.member_profiles(id) on delete set null,
  membership_request_id uuid references public.membership_requests(id) on delete set null,
  staff_user_id uuid references auth.users(id) on delete set null,
  staff_email text,
  details jsonb not null default '{}'::jsonb,
  constraint membership_qr_scan_events_result_code_check check (
    result_code in (
      'ok',
      'invalid_format',
      'member_not_found',
      'inactive_membership',
      'expired_membership',
      'payment_pending',
      'forbidden',
      'server_error'
    )
  )
);

create index if not exists membership_qr_scan_events_scanned_at_idx
  on public.membership_qr_scan_events(scanned_at desc);

create index if not exists membership_qr_scan_events_result_idx
  on public.membership_qr_scan_events(result_code, scanned_at desc);

create index if not exists membership_qr_scan_events_member_idx
  on public.membership_qr_scan_events(member_id, scanned_at desc);

create index if not exists membership_qr_scan_events_staff_idx
  on public.membership_qr_scan_events(staff_user_id, scanned_at desc);

alter table public.membership_qr_scan_events enable row level security;
