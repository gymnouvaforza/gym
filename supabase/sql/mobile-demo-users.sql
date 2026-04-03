-- Mobile demo users linkage seed
-- Safe to run multiple times.
-- Assumes the auth users already exist in auth.users.

insert into public.member_commerce_customers (
  supabase_user_id,
  email,
  medusa_customer_id,
  created_at,
  updated_at
)
select
  u.id,
  u.email,
  'demo-' || replace(split_part(u.email, '@', 1), '.', '-'),
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email in (
  'entrenador@novaforza.com',
  'usuario1@novaforza.com',
  'usuario2@novaforza.com',
  'usuario3@novaforza.com'
)
on conflict (supabase_user_id) do update set
  email = excluded.email,
  medusa_customer_id = excluded.medusa_customer_id,
  updated_at = timezone('utc', now());

insert into public.user_roles (
  user_id,
  role,
  note,
  is_irreversible,
  assigned_at,
  created_at,
  updated_at
)
select
  u.id,
  'trainer',
  'Demo mobile trainer seed',
  true,
  timezone('utc', now()),
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email = 'entrenador@novaforza.com'
on conflict (user_id, role) do update set
  note = excluded.note,
  is_irreversible = excluded.is_irreversible,
  updated_at = timezone('utc', now());

insert into public.trainer_profiles (
  user_id,
  display_name,
  branch_name,
  bio,
  is_active,
  created_at,
  updated_at
)
select
  u.id,
  'Coach Nova',
  'Centro - Monolito',
  'Perfil demo mobile para staff.',
  true,
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email = 'entrenador@novaforza.com'
on conflict (user_id) do update set
  display_name = excluded.display_name,
  branch_name = excluded.branch_name,
  bio = excluded.bio,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

with demo_trainer as (
  select id
  from auth.users
  where email = 'entrenador@novaforza.com'
  limit 1
)
insert into public.member_profiles (
  id,
  supabase_user_id,
  trainer_user_id,
  member_number,
  full_name,
  email,
  phone,
  status,
  branch_name,
  notes,
  join_date,
  created_at,
  updated_at
)
select
  case u.email
    when 'usuario1@novaforza.com' then '10000000-0000-0000-0000-000000000001'::uuid
    when 'usuario2@novaforza.com' then '10000000-0000-0000-0000-000000000002'::uuid
    when 'usuario3@novaforza.com' then '10000000-0000-0000-0000-000000000003'::uuid
  end,
  u.id,
  demo_trainer.id,
  case u.email
    when 'usuario1@novaforza.com' then 'NF-101'
    when 'usuario2@novaforza.com' then 'NF-102'
    when 'usuario3@novaforza.com' then 'NF-103'
  end,
  case u.email
    when 'usuario1@novaforza.com' then 'Usuario Uno'
    when 'usuario2@novaforza.com' then 'Usuario Dos'
    when 'usuario3@novaforza.com' then 'Usuario Tres'
  end,
  u.email,
  case u.email
    when 'usuario1@novaforza.com' then '+34 600 111 111'
    when 'usuario2@novaforza.com' then '+34 600 222 222'
    when 'usuario3@novaforza.com' then '+34 600 333 333'
  end,
  case u.email
    when 'usuario3@novaforza.com' then 'paused'
    else 'active'
  end,
  'Centro - Monolito',
  case u.email
    when 'usuario2@novaforza.com' then 'Demo sin rutina activa para validar empty state real.'
    else null
  end,
  case u.email
    when 'usuario1@novaforza.com' then '2025-01-10'::date
    when 'usuario2@novaforza.com' then '2025-02-14'::date
    when 'usuario3@novaforza.com' then '2025-03-01'::date
  end,
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
cross join demo_trainer
where u.email in (
  'usuario1@novaforza.com',
  'usuario2@novaforza.com',
  'usuario3@novaforza.com'
)
on conflict (supabase_user_id) do update set
  trainer_user_id = excluded.trainer_user_id,
  member_number = excluded.member_number,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  status = excluded.status,
  branch_name = excluded.branch_name,
  notes = excluded.notes,
  join_date = excluded.join_date,
  updated_at = timezone('utc', now());

insert into public.member_plan_snapshots (
  id,
  member_id,
  label,
  status,
  started_at,
  ends_at,
  notes,
  is_current,
  created_at,
  updated_at
)
values
  (
    '20000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'Elite Performance',
    'active',
    '2025-01-10'::date,
    null,
    'Plan demo con rutina activa.',
    true,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '20000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000002'::uuid,
    'Fuerza Basica',
    'active',
    '2025-02-14'::date,
    null,
    'Plan demo sin rutina para validar asignacion.',
    true,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '20000000-0000-0000-0000-000000000003'::uuid,
    '10000000-0000-0000-0000-000000000003'::uuid,
    'Hipertrofia Controlada',
    'paused',
    '2025-03-01'::date,
    null,
    'Plan demo pausado.',
    true,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  label = excluded.label,
  status = excluded.status,
  started_at = excluded.started_at,
  ends_at = excluded.ends_at,
  notes = excluded.notes,
  is_current = excluded.is_current,
  updated_at = timezone('utc', now());

insert into public.routine_templates (
  id,
  trainer_user_id,
  title,
  goal,
  summary,
  duration_label,
  intensity_label,
  status_label,
  is_active,
  created_at,
  updated_at
)
select
  '30000000-0000-0000-0000-000000000001'::uuid,
  u.id,
  'FUERZA BASE A',
  'Construir base de fuerza general.',
  'Empuje, traccion y pierna con volumen controlado.',
  '8 semanas',
  'Media / Alta',
  'Activa',
  true,
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email = 'entrenador@novaforza.com'
on conflict (id) do update set
  trainer_user_id = excluded.trainer_user_id,
  title = excluded.title,
  goal = excluded.goal,
  summary = excluded.summary,
  duration_label = excluded.duration_label,
  intensity_label = excluded.intensity_label,
  status_label = excluded.status_label,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

insert into public.routine_templates (
  id,
  trainer_user_id,
  title,
  goal,
  summary,
  duration_label,
  intensity_label,
  status_label,
  is_active,
  created_at,
  updated_at
)
select
  '30000000-0000-0000-0000-000000000002'::uuid,
  u.id,
  'HIPERTROFIA CONTROLADA',
  'Mejorar volumen y tecnica.',
  'Trabajo estructurado para torso y pierna con fatiga moderada.',
  '6 semanas',
  'Media',
  'Activa',
  true,
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email = 'entrenador@novaforza.com'
on conflict (id) do update set
  trainer_user_id = excluded.trainer_user_id,
  title = excluded.title,
  goal = excluded.goal,
  summary = excluded.summary,
  duration_label = excluded.duration_label,
  intensity_label = excluded.intensity_label,
  status_label = excluded.status_label,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

insert into public.routine_template_blocks (
  id,
  routine_template_id,
  title,
  description,
  sort_order,
  created_at,
  updated_at
)
values
  (
    '31000000-0000-0000-0000-000000000001'::uuid,
    '30000000-0000-0000-0000-000000000001'::uuid,
    'Bloque 1',
    'Fuerza bilateral y empuje.',
    0,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '31000000-0000-0000-0000-000000000002'::uuid,
    '30000000-0000-0000-0000-000000000002'::uuid,
    'Bloque 1',
    'Trabajo mixto de hipertrofia.',
    0,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.routine_template_exercises (
  id,
  routine_block_id,
  name,
  sets_label,
  reps_label,
  rest_seconds,
  notes,
  sort_order,
  created_at,
  updated_at
)
values
  (
    '32000000-0000-0000-0000-000000000001'::uuid,
    '31000000-0000-0000-0000-000000000001'::uuid,
    'Press banca',
    '4',
    '6',
    120,
    'Subir carga si sale limpio.',
    0,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '32000000-0000-0000-0000-000000000002'::uuid,
    '31000000-0000-0000-0000-000000000001'::uuid,
    'Remo con barra',
    '4',
    '8',
    90,
    null,
    1,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '32000000-0000-0000-0000-000000000003'::uuid,
    '31000000-0000-0000-0000-000000000002'::uuid,
    'Sentadilla goblet',
    '3',
    '12',
    75,
    null,
    0,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '32000000-0000-0000-0000-000000000004'::uuid,
    '31000000-0000-0000-0000-000000000002'::uuid,
    'Jalon al pecho',
    '3',
    '12',
    60,
    'Controla la excentrica.',
    1,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  name = excluded.name,
  sets_label = excluded.sets_label,
  reps_label = excluded.reps_label,
  rest_seconds = excluded.rest_seconds,
  notes = excluded.notes,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.routine_assignments (
  id,
  member_id,
  routine_template_id,
  trainer_user_id,
  notes,
  starts_on,
  ends_on,
  assigned_at,
  status,
  created_at,
  updated_at
)
select
  '33000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  u.id,
  'Asignacion demo activa para usuario 1.',
  '2025-03-15'::date,
  null,
  timezone('utc', now()),
  'active',
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email = 'entrenador@novaforza.com'
on conflict (id) do update set
  trainer_user_id = excluded.trainer_user_id,
  notes = excluded.notes,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status,
  updated_at = timezone('utc', now());

insert into public.routine_assignments (
  id,
  member_id,
  routine_template_id,
  trainer_user_id,
  notes,
  starts_on,
  ends_on,
  assigned_at,
  status,
  created_at,
  updated_at
)
select
  '33000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000003'::uuid,
  '30000000-0000-0000-0000-000000000002'::uuid,
  u.id,
  'Historial demo archivado para usuario 3.',
  '2025-03-05'::date,
  '2025-03-28'::date,
  timezone('utc', now()),
  'archived',
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
where u.email = 'entrenador@novaforza.com'
on conflict (id) do update set
  trainer_user_id = excluded.trainer_user_id,
  notes = excluded.notes,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status,
  updated_at = timezone('utc', now());
