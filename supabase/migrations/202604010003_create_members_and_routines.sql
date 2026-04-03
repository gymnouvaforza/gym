create table if not exists public.trainer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  branch_name text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.trainer_profiles enable row level security;

drop policy if exists "Users can read own trainer profile" on public.trainer_profiles;
create policy "Users can read own trainer profile"
  on public.trainer_profiles
  for select
  using (auth.uid() = user_id);

drop trigger if exists set_trainer_profiles_updated_at on public.trainer_profiles;
create trigger set_trainer_profiles_updated_at
  before update on public.trainer_profiles
  for each row
  execute function public.handle_updated_at();

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid unique references auth.users(id) on delete set null,
  trainer_user_id uuid references auth.users(id) on delete set null,
  member_number text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  status text not null default 'prospect',
  branch_name text,
  notes text,
  join_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint member_profiles_status_check check (status in ('prospect', 'active', 'paused', 'cancelled', 'former'))
);

create index if not exists member_profiles_status_idx
  on public.member_profiles(status);

create index if not exists member_profiles_trainer_user_id_idx
  on public.member_profiles(trainer_user_id);

alter table public.member_profiles enable row level security;

drop policy if exists "Members can read own profile" on public.member_profiles;
create policy "Members can read own profile"
  on public.member_profiles
  for select
  using (auth.uid() = supabase_user_id);

drop trigger if exists set_member_profiles_updated_at on public.member_profiles;
create trigger set_member_profiles_updated_at
  before update on public.member_profiles
  for each row
  execute function public.handle_updated_at();

create table if not exists public.member_plan_snapshots (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  label text not null,
  status text not null default 'active',
  started_at date,
  ends_at date,
  notes text,
  is_current boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint member_plan_snapshots_status_check check (status in ('active', 'paused', 'cancelled', 'expired'))
);

create unique index if not exists member_plan_snapshots_current_member_idx
  on public.member_plan_snapshots(member_id)
  where is_current = true;

create index if not exists member_plan_snapshots_member_id_idx
  on public.member_plan_snapshots(member_id);

alter table public.member_plan_snapshots enable row level security;

drop policy if exists "Members can read own plan snapshots" on public.member_plan_snapshots;
create policy "Members can read own plan snapshots"
  on public.member_plan_snapshots
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_plan_snapshots.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop trigger if exists set_member_plan_snapshots_updated_at on public.member_plan_snapshots;
create trigger set_member_plan_snapshots_updated_at
  before update on public.member_plan_snapshots
  for each row
  execute function public.handle_updated_at();

create table if not exists public.routine_templates (
  id uuid primary key default gen_random_uuid(),
  trainer_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  goal text not null,
  summary text not null,
  duration_label text not null,
  intensity_label text not null,
  status_label text not null default 'Activa',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists routine_templates_trainer_user_id_idx
  on public.routine_templates(trainer_user_id);

alter table public.routine_templates enable row level security;

drop policy if exists "Authenticated users can read active routine templates" on public.routine_templates;
create policy "Authenticated users can read active routine templates"
  on public.routine_templates
  for select
  using (auth.role() = 'authenticated' and is_active = true);

drop trigger if exists set_routine_templates_updated_at on public.routine_templates;
create trigger set_routine_templates_updated_at
  before update on public.routine_templates
  for each row
  execute function public.handle_updated_at();

create table if not exists public.routine_template_blocks (
  id uuid primary key default gen_random_uuid(),
  routine_template_id uuid not null references public.routine_templates(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists routine_template_blocks_template_order_idx
  on public.routine_template_blocks(routine_template_id, sort_order);

alter table public.routine_template_blocks enable row level security;

drop policy if exists "Authenticated users can read routine template blocks" on public.routine_template_blocks;
create policy "Authenticated users can read routine template blocks"
  on public.routine_template_blocks
  for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.routine_templates
      where routine_templates.id = routine_template_blocks.routine_template_id
        and routine_templates.is_active = true
    )
  );

drop trigger if exists set_routine_template_blocks_updated_at on public.routine_template_blocks;
create trigger set_routine_template_blocks_updated_at
  before update on public.routine_template_blocks
  for each row
  execute function public.handle_updated_at();

create table if not exists public.routine_template_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_block_id uuid not null references public.routine_template_blocks(id) on delete cascade,
  name text not null,
  sets_label text not null,
  reps_label text not null,
  rest_seconds integer not null default 0,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint routine_template_exercises_rest_seconds_check check (rest_seconds >= 0)
);

create index if not exists routine_template_exercises_block_order_idx
  on public.routine_template_exercises(routine_block_id, sort_order);

alter table public.routine_template_exercises enable row level security;

drop policy if exists "Authenticated users can read routine template exercises" on public.routine_template_exercises;
create policy "Authenticated users can read routine template exercises"
  on public.routine_template_exercises
  for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.routine_template_blocks
      join public.routine_templates
        on public.routine_templates.id = public.routine_template_blocks.routine_template_id
      where public.routine_template_blocks.id = routine_template_exercises.routine_block_id
        and public.routine_templates.is_active = true
    )
  );

drop trigger if exists set_routine_template_exercises_updated_at on public.routine_template_exercises;
create trigger set_routine_template_exercises_updated_at
  before update on public.routine_template_exercises
  for each row
  execute function public.handle_updated_at();

create table if not exists public.routine_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete cascade,
  routine_template_id uuid not null references public.routine_templates(id) on delete restrict,
  trainer_user_id uuid references auth.users(id) on delete set null,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  notes text,
  starts_on date,
  ends_on date,
  assigned_at timestamptz not null default timezone('utc', now()),
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint routine_assignments_status_check check (status in ('active', 'archived', 'completed'))
);

create unique index if not exists routine_assignments_member_active_idx
  on public.routine_assignments(member_id)
  where status = 'active';

create index if not exists routine_assignments_member_assigned_at_idx
  on public.routine_assignments(member_id, assigned_at desc);

create index if not exists routine_assignments_template_id_idx
  on public.routine_assignments(routine_template_id);

alter table public.routine_assignments enable row level security;

drop policy if exists "Members can read own routine assignments" on public.routine_assignments;
create policy "Members can read own routine assignments"
  on public.routine_assignments
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = routine_assignments.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop trigger if exists set_routine_assignments_updated_at on public.routine_assignments;
create trigger set_routine_assignments_updated_at
  before update on public.routine_assignments
  for each row
  execute function public.handle_updated_at();
