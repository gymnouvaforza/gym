alter table public.membership_plans
  add column if not exists medusa_product_id text,
  add column if not exists medusa_variant_id text,
  add column if not exists medusa_sync_status text,
  add column if not exists medusa_sync_error text,
  add column if not exists medusa_synced_at timestamptz;

update public.membership_plans
set medusa_sync_status = coalesce(nullif(trim(medusa_sync_status), ''), 'pending')
where medusa_sync_status is null
   or trim(medusa_sync_status) = '';

alter table public.membership_plans
  alter column medusa_sync_status set default 'pending',
  alter column medusa_sync_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'membership_plans_medusa_sync_status_check'
  ) then
    alter table public.membership_plans
      add constraint membership_plans_medusa_sync_status_check
      check (medusa_sync_status in ('pending', 'ok', 'error'));
  end if;
end $$;

create index if not exists membership_plans_medusa_sync_status_idx
  on public.membership_plans(medusa_sync_status);

alter table public.membership_requests
  add column if not exists medusa_product_id text,
  add column if not exists medusa_variant_id text,
  add column if not exists medusa_cart_id text,
  add column if not exists medusa_order_id text,
  add column if not exists medusa_sync_status text,
  add column if not exists medusa_sync_error text,
  add column if not exists medusa_synced_at timestamptz;

update public.membership_requests
set medusa_sync_status = coalesce(nullif(trim(medusa_sync_status), ''), 'pending')
where medusa_sync_status is null
   or trim(medusa_sync_status) = '';

alter table public.membership_requests
  alter column medusa_sync_status set default 'pending',
  alter column medusa_sync_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'membership_requests_medusa_sync_status_check'
  ) then
    alter table public.membership_requests
      add constraint membership_requests_medusa_sync_status_check
      check (medusa_sync_status in ('pending', 'ok', 'error'));
  end if;
end $$;

create index if not exists membership_requests_medusa_sync_status_idx
  on public.membership_requests(medusa_sync_status, updated_at desc);
