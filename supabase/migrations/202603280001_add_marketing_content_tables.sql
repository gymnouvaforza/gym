create table if not exists public.marketing_plans (
  id uuid primary key default gen_random_uuid(),
  site_settings_id integer not null default 1 references public.site_settings (id) on delete cascade,
  title text not null,
  description text,
  price_label text not null,
  billing_label text not null,
  badge text,
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  "order" integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketing_schedule_rows (
  id uuid primary key default gen_random_uuid(),
  site_settings_id integer not null default 1 references public.site_settings (id) on delete cascade,
  label text not null,
  description text,
  opens_at text not null,
  closes_at text not null,
  "order" integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists marketing_plans_site_settings_order_idx
  on public.marketing_plans (site_settings_id, "order");

create index if not exists marketing_schedule_rows_site_settings_order_idx
  on public.marketing_schedule_rows (site_settings_id, "order");

alter table public.marketing_plans enable row level security;
alter table public.marketing_schedule_rows enable row level security;

drop policy if exists "marketing_plans public read" on public.marketing_plans;
create policy "marketing_plans public read"
on public.marketing_plans
for select
using (true);

drop policy if exists "marketing_plans auth manage" on public.marketing_plans;
create policy "marketing_plans auth manage"
on public.marketing_plans
for all
to authenticated
using (true)
with check (true);

drop policy if exists "marketing_schedule_rows public read" on public.marketing_schedule_rows;
create policy "marketing_schedule_rows public read"
on public.marketing_schedule_rows
for select
using (true);

drop policy if exists "marketing_schedule_rows auth manage" on public.marketing_schedule_rows;
create policy "marketing_schedule_rows auth manage"
on public.marketing_schedule_rows
for all
to authenticated
using (true)
with check (true);

insert into public.marketing_plans (
  id,
  site_settings_id,
  title,
  description,
  price_label,
  billing_label,
  badge,
  features,
  is_featured,
  "order",
  is_active,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    1,
    'Basico Forza',
    null,
    'S/150',
    '/mes',
    null,
    '[{"label":"Acceso zona pesas libre","included":true},{"label":"Horarios limitados","included":false},{"label":"Sin asesoria nutricional","included":false}]'::jsonb,
    false,
    0,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    1,
    'Elite Mensual',
    null,
    'S/280',
    '/mes',
    'Recomendado',
    '[{"label":"Acceso total 24/7","included":true},{"label":"Evaluacion nutricional","included":true},{"label":"1 Sesion PT mensual","included":true},{"label":"Acceso a clases grupales","included":true}]'::jsonb,
    true,
    1,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    1,
    'Plan Anual Pro',
    null,
    'S/2500',
    '/ano',
    null,
    '[{"label":"Todo lo del plan Elite","included":true},{"label":"2 Sesiones PT/mes","included":true},{"label":"Kit Nova Forza de bienvenida","included":true},{"label":"Invitado mensual gratuito","included":true}]'::jsonb,
    false,
    2,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  site_settings_id = excluded.site_settings_id,
  title = excluded.title,
  description = excluded.description,
  price_label = excluded.price_label,
  billing_label = excluded.billing_label,
  badge = excluded.badge,
  features = excluded.features,
  is_featured = excluded.is_featured,
  "order" = excluded."order",
  is_active = excluded.is_active,
  updated_at = excluded.updated_at;

insert into public.marketing_schedule_rows (
  id,
  site_settings_id,
  label,
  description,
  opens_at,
  closes_at,
  "order",
  is_active,
  created_at,
  updated_at
)
values
  (
    '44444444-4444-4444-4444-444444444444',
    1,
    'Lunes - Viernes',
    null,
    '05:00 AM',
    '11:00 PM',
    0,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    1,
    'Sabados',
    null,
    '07:00 AM',
    '08:00 PM',
    1,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    1,
    'Domingos y Feriados',
    null,
    '08:00 AM',
    '04:00 PM',
    2,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  site_settings_id = excluded.site_settings_id,
  label = excluded.label,
  description = excluded.description,
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at,
  "order" = excluded."order",
  is_active = excluded.is_active,
  updated_at = excluded.updated_at;
