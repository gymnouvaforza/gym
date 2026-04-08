create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  price_amount numeric(10, 2) not null,
  currency_code text not null default 'PEN',
  billing_label text,
  duration_days integer not null default 30,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint membership_plans_price_amount_check check (price_amount >= 0),
  constraint membership_plans_duration_days_check check (duration_days > 0)
);

create index if not exists membership_plans_active_sort_idx
  on public.membership_plans(is_active, sort_order, created_at desc);

alter table public.membership_plans enable row level security;

drop policy if exists "Public can read active membership plans" on public.membership_plans;
create policy "Public can read active membership plans"
  on public.membership_plans
  for select
  using (is_active = true);

drop trigger if exists set_membership_plans_updated_at on public.membership_plans;
create trigger set_membership_plans_updated_at
  before update on public.membership_plans
  for each row
  execute function public.handle_updated_at();

insert into public.membership_plans (
  slug,
  title,
  description,
  price_amount,
  currency_code,
  billing_label,
  duration_days,
  is_active,
  is_featured,
  sort_order,
  notes
)
select *
from (
  values
    (
      'base-30d',
      'Membresia Base',
      'Acceso general al club y seguimiento operativo basico para socios que pagan de forma flexible.',
      120.00,
      'PEN',
      '30 dias',
      30,
      true,
      true,
      10,
      'Plan inicial para operacion manual del gym.'
    ),
    (
      'fuerza-30d',
      'Membresia Fuerza',
      'Pensada para alumnos en fase activa de entrenamiento con acompanamiento y renovacion mensual.',
      180.00,
      'PEN',
      '30 dias',
      30,
      true,
      false,
      20,
      'Incluye espacio para asignacion de coach responsable.'
    ),
    (
      'elite-30d',
      'Membresia Elite',
      'Plan premium para clientes con seguimiento mas cercano, pagos fraccionados y control de vigencia manual.',
      260.00,
      'PEN',
      '30 dias',
      30,
      true,
      false,
      30,
      'Usar como base mientras se cierra el catalogo definitivo.'
    )
) as seed(
  slug,
  title,
  description,
  price_amount,
  currency_code,
  billing_label,
  duration_days,
  is_active,
  is_featured,
  sort_order,
  notes
)
where not exists (
  select 1
  from public.membership_plans existing
  where existing.slug = seed.slug
);

alter table public.member_profiles
  add column if not exists membership_plan_id uuid,
  add column if not exists training_plan_label text,
  add column if not exists membership_qr_token uuid not null default gen_random_uuid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_membership_plan_id_fkey'
  ) then
    alter table public.member_profiles
      add constraint member_profiles_membership_plan_id_fkey
      foreign key (membership_plan_id)
      references public.membership_plans(id)
      on delete set null;
  end if;
end $$;

create unique index if not exists member_profiles_membership_qr_token_idx
  on public.member_profiles(membership_qr_token);

create index if not exists member_profiles_membership_plan_id_idx
  on public.member_profiles(membership_plan_id);

create table if not exists public.membership_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  supabase_user_id uuid references auth.users(id) on delete set null,
  membership_plan_id uuid not null references public.membership_plans(id) on delete restrict,
  email text not null,
  plan_title_snapshot text not null,
  price_amount numeric(10, 2) not null,
  currency_code text not null default 'PEN',
  billing_label text,
  duration_days integer not null default 30,
  status text not null default 'requested',
  email_status text not null default 'pending',
  email_sent_at timestamptz,
  email_error text,
  source text not null default 'member-portal',
  notes text,
  cycle_starts_on date,
  cycle_ends_on date,
  renews_from_request_id uuid references public.membership_requests(id) on delete set null,
  activated_at timestamptz,
  manual_paid_total numeric(10, 2) not null default 0,
  manual_balance_due numeric(10, 2) not null default 0,
  manual_payment_status text not null default 'pending',
  manual_payment_entry_count integer not null default 0,
  manual_payment_updated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint membership_requests_price_amount_check check (price_amount >= 0),
  constraint membership_requests_duration_days_check check (duration_days > 0),
  constraint membership_requests_status_check check (
    status in ('requested', 'confirmed', 'active', 'paused', 'expired', 'cancelled')
  ),
  constraint membership_requests_email_status_check check (
    email_status in ('pending', 'sent', 'failed')
  ),
  constraint membership_requests_manual_payment_status_check check (
    manual_payment_status in ('pending', 'partial', 'paid', 'overpaid')
  )
);

create index if not exists membership_requests_member_created_idx
  on public.membership_requests(member_id, created_at desc);

create index if not exists membership_requests_user_created_idx
  on public.membership_requests(supabase_user_id, created_at desc);

create index if not exists membership_requests_status_created_idx
  on public.membership_requests(status, created_at desc);

alter table public.membership_requests enable row level security;

drop policy if exists "Members can read own membership requests" on public.membership_requests;
create policy "Members can read own membership requests"
  on public.membership_requests
  for select
  using (
    auth.uid() = supabase_user_id
    or exists (
      select 1
      from public.member_profiles
      where member_profiles.id = membership_requests.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop trigger if exists set_membership_requests_updated_at on public.membership_requests;
create trigger set_membership_requests_updated_at
  before update on public.membership_requests
  for each row
  execute function public.handle_updated_at();

create table if not exists public.membership_request_annotations (
  id uuid primary key default gen_random_uuid(),
  membership_request_id uuid not null references public.membership_requests(id) on delete cascade,
  content text not null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_by_email text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists membership_request_annotations_request_id_idx
  on public.membership_request_annotations(membership_request_id, created_at desc);

alter table public.membership_request_annotations enable row level security;

create table if not exists public.membership_payment_entries (
  id uuid primary key default gen_random_uuid(),
  membership_request_id uuid not null references public.membership_requests(id) on delete cascade,
  amount numeric(10, 2) not null,
  currency_code text not null default 'PEN',
  note text,
  recorded_at timestamptz not null default timezone('utc', now()),
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_by_email text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint membership_payment_entries_amount_check check (amount > 0)
);

create index if not exists membership_payment_entries_request_id_idx
  on public.membership_payment_entries(membership_request_id, recorded_at desc);

alter table public.membership_payment_entries enable row level security;

drop policy if exists "Members can read own membership payment entries" on public.membership_payment_entries;
create policy "Members can read own membership payment entries"
  on public.membership_payment_entries
  for select
  using (
    exists (
      select 1
      from public.membership_requests
      where membership_requests.id = membership_payment_entries.membership_request_id
        and (
          membership_requests.supabase_user_id = auth.uid()
          or exists (
            select 1
            from public.member_profiles
            where member_profiles.id = membership_requests.member_id
              and member_profiles.supabase_user_id = auth.uid()
          )
        )
    )
  );

create or replace function public.refresh_membership_request_manual_payment_summary(target_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  paid_total numeric(10, 2);
  target_total numeric(10, 2);
  entry_count integer;
  latest_recorded_at timestamptz;
  resolved_status text;
begin
  select
    coalesce(sum(amount), 0),
    count(*),
    max(recorded_at)
  into paid_total, entry_count, latest_recorded_at
  from public.membership_payment_entries
  where membership_request_id = target_request_id;

  select price_amount
  into target_total
  from public.membership_requests
  where id = target_request_id;

  target_total := coalesce(target_total, 0);
  paid_total := coalesce(paid_total, 0);
  entry_count := coalesce(entry_count, 0);

  if paid_total <= 0 then
    resolved_status := 'pending';
  elsif paid_total < target_total then
    resolved_status := 'partial';
  elsif paid_total = target_total then
    resolved_status := 'paid';
  else
    resolved_status := 'overpaid';
  end if;

  update public.membership_requests
  set
    manual_paid_total = paid_total,
    manual_balance_due = greatest(target_total - paid_total, 0),
    manual_payment_status = resolved_status,
    manual_payment_entry_count = entry_count,
    manual_payment_updated_at = latest_recorded_at
  where id = target_request_id;
end;
$$;

create or replace function public.handle_membership_payment_entries_summary_refresh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_membership_request_manual_payment_summary(old.membership_request_id);
    return old;
  end if;

  perform public.refresh_membership_request_manual_payment_summary(new.membership_request_id);
  return new;
end;
$$;

drop trigger if exists refresh_membership_request_manual_payment_summary_on_entry_change
  on public.membership_payment_entries;
create trigger refresh_membership_request_manual_payment_summary_on_entry_change
  after insert or update or delete on public.membership_payment_entries
  for each row
  execute function public.handle_membership_payment_entries_summary_refresh();

create or replace function public.handle_membership_request_total_summary_refresh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_membership_request_manual_payment_summary(new.id);
  return new;
end;
$$;

drop trigger if exists refresh_membership_request_manual_payment_summary_on_total_change
  on public.membership_requests;
create trigger refresh_membership_request_manual_payment_summary_on_total_change
  after insert or update of price_amount on public.membership_requests
  for each row
  execute function public.handle_membership_request_total_summary_refresh();
