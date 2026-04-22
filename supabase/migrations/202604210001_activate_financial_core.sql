-- Migración: Activar Núcleo Financiero y Seguimiento Físico
-- Nova Forza Gym - Professional Management Platform

-- 1. Tabla de Membresías (Estado de Deuda y Activación)
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  plan_id uuid references public.membership_plans(id) on delete set null,
  total_price numeric(10, 2) not null default 0,
  balance_due numeric(10, 2) not null default 0,
  manual_activation_status text not null default 'pending',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint memberships_manual_activation_status_check check (manual_activation_status in ('pending', 'active', 'expired')),
  constraint memberships_balance_due_check check (balance_due >= 0)
);

create index if not exists memberships_member_id_idx on public.memberships(member_id);
create index if not exists memberships_status_idx on public.memberships(manual_activation_status);

alter table public.memberships enable row level security;

-- 2. Tabla de Pagos (Ledger)
create table if not exists public.member_payments (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  amount_paid numeric(10, 2) not null,
  payment_method text not null,
  reference_code text,
  recorded_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint member_payments_payment_method_check check (payment_method in ('cash', 'yape', 'plin', 'bank_transfer')),
  constraint member_payments_amount_paid_check check (amount_paid > 0)
);

create index if not exists member_payments_membership_id_idx on public.member_payments(membership_id);

alter table public.member_payments enable row level security;

-- 3. Tabla de Medidas Físicas
create table if not exists public.member_measurements (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  weight numeric(5, 2), -- kg
  fat_percentage numeric(4, 2), -- %
  perimeters jsonb default '{}'::jsonb, -- { "waist": 80, "chest": 100, ... }
  recorded_at date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists member_measurements_member_id_idx on public.member_measurements(member_id, recorded_at desc);

alter table public.member_measurements enable row level security;

-- 4. RLS - Solo Admin y Staff
-- Asumiendo que existe una forma de identificar roles (ya vi una migración de roles anteriormente)
-- Usaremos una verificación genérica de 'staff'/'admin' basada en lo que suele haber en este proyecto.

create policy "Admins and Staff can manage memberships"
  on public.memberships
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('admin', 'trainer')
    )
  );

create policy "Admins and Staff can manage member_payments"
  on public.member_payments
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('admin', 'trainer')
    )
  );

create policy "Admins and Staff can manage member_measurements"
  on public.member_measurements
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('admin', 'trainer')
    )
  );

-- 5. Triggers para updated_at
create trigger set_memberships_updated_at
  before update on public.memberships
  for each row
  execute function public.handle_updated_at();

create trigger set_member_measurements_updated_at
  before update on public.member_measurements
  for each row
  execute function public.handle_updated_at();
