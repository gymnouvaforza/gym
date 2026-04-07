alter table if exists public.pickup_request
  add column if not exists manual_paid_total double precision not null default 0,
  add column if not exists manual_balance_due double precision not null default 0,
  add column if not exists manual_payment_status text not null default 'pending',
  add column if not exists manual_payment_entry_count integer not null default 0,
  add column if not exists manual_payment_updated_at timestamptz;

alter table if exists public.pickup_request
  drop constraint if exists pickup_request_manual_payment_status_check;

alter table if exists public.pickup_request
  add constraint pickup_request_manual_payment_status_check check (
    manual_payment_status in ('pending', 'partial', 'paid', 'overpaid')
  );

create table if not exists public.pickup_request_payment_entries (
  id uuid primary key default gen_random_uuid(),
  pickup_request_id text not null references public.pickup_request (id) on delete cascade,
  amount double precision not null,
  currency_code text not null,
  note text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by_user_id text,
  created_by_email text,
  constraint pickup_request_payment_entries_amount_check check (amount > 0),
  constraint pickup_request_payment_entries_note_check check (
    note is null or char_length(trim(note)) <= 1000
  )
);

create index if not exists pickup_request_payment_entries_pickup_request_id_idx
  on public.pickup_request_payment_entries (pickup_request_id, recorded_at desc);

create index if not exists pickup_request_manual_payment_status_idx
  on public.pickup_request (manual_payment_status);

create or replace function public.refresh_pickup_request_manual_payment_summary(
  target_pickup_request_id text
)
returns void
language plpgsql
set search_path = public
as $$
declare
  order_total numeric(12, 2);
  paid_total numeric(12, 2);
  balance_due numeric(12, 2);
  payment_entries_count integer;
  last_payment_at timestamptz;
  resolved_status text;
begin
  select
    round(coalesce(pr.total, 0)::numeric, 2),
    round(coalesce(sum(entries.amount), 0)::numeric, 2),
    count(entries.id)::integer,
    max(entries.recorded_at)
  into
    order_total,
    paid_total,
    payment_entries_count,
    last_payment_at
  from public.pickup_request as pr
  left join public.pickup_request_payment_entries as entries
    on entries.pickup_request_id = pr.id
  where pr.id = target_pickup_request_id
  group by pr.id;

  if not found then
    return;
  end if;

  balance_due := greatest(order_total - paid_total, 0);

  resolved_status := case
    when order_total <= 0 then 'paid'
    when paid_total <= 0 then 'pending'
    when paid_total < order_total then 'partial'
    when paid_total = order_total then 'paid'
    else 'overpaid'
  end;

  update public.pickup_request
  set
    manual_paid_total = paid_total::double precision,
    manual_balance_due = balance_due::double precision,
    manual_payment_status = resolved_status,
    manual_payment_entry_count = payment_entries_count,
    manual_payment_updated_at = last_payment_at,
    updated_at = now()
  where id = target_pickup_request_id;
end;
$$;

create or replace function public.handle_pickup_request_payment_entry_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform public.refresh_pickup_request_manual_payment_summary(
    coalesce(new.pickup_request_id, old.pickup_request_id)
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_pickup_request_manual_payment_summary_on_entry_change
  on public.pickup_request_payment_entries;

create trigger refresh_pickup_request_manual_payment_summary_on_entry_change
  after insert or update or delete on public.pickup_request_payment_entries
  for each row
  execute function public.handle_pickup_request_payment_entry_change();

create or replace function public.handle_pickup_request_total_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform public.refresh_pickup_request_manual_payment_summary(new.id);
  return new;
end;
$$;

drop trigger if exists refresh_pickup_request_manual_payment_summary_on_total_change
  on public.pickup_request;

create trigger refresh_pickup_request_manual_payment_summary_on_total_change
  after insert or update of total on public.pickup_request
  for each row
  execute function public.handle_pickup_request_total_change();

do $$
declare
  pickup_request_record record;
begin
  for pickup_request_record in
    select id
    from public.pickup_request
    where deleted_at is null
  loop
    perform public.refresh_pickup_request_manual_payment_summary(pickup_request_record.id);
  end loop;
end;
$$;
