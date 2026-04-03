create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  assigned_at timestamptz not null default timezone('utc', now()),
  assigned_by uuid references auth.users(id) on delete set null,
  note text,
  is_irreversible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role),
  constraint user_roles_role_check check (role in ('trainer'))
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

create index if not exists user_roles_user_id_idx
  on public.user_roles(user_id);

create index if not exists user_roles_role_idx
  on public.user_roles(role);

drop trigger if exists set_user_roles_updated_at on public.user_roles;

create trigger set_user_roles_updated_at
  before update on public.user_roles
  for each row
  execute function public.handle_updated_at();
