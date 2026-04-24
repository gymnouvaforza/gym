create table if not exists public.training_zones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_label text not null,
  subtitle text,
  description text not null,
  icon text not null,
  video_url text not null,
  poster_url text,
  cta_label text,
  cta_href text,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists training_zones_active_order_idx
  on public.training_zones (active, order_index);

drop trigger if exists set_training_zones_updated_at on public.training_zones;
create trigger set_training_zones_updated_at
  before update on public.training_zones
  for each row
  execute function public.handle_updated_at();

alter table public.training_zones enable row level security;

drop policy if exists "training_zones public read" on public.training_zones;
create policy "training_zones public read"
on public.training_zones
for select
to public
using (true);

drop policy if exists "training_zones admin insert" on public.training_zones;
create policy "training_zones admin insert"
on public.training_zones
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
);

drop policy if exists "training_zones admin update" on public.training_zones;
create policy "training_zones admin update"
on public.training_zones
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
);

drop policy if exists "training_zones admin delete" on public.training_zones;
create policy "training_zones admin delete"
on public.training_zones
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
);

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('media', 'media', true, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read media bucket" on storage.objects;
create policy "Public read media bucket"
on storage.objects
for select
to public
using (bucket_id = 'media');

drop policy if exists "Admins insert media bucket" on storage.objects;
create policy "Admins insert media bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
);

drop policy if exists "Admins update media bucket" on storage.objects;
create policy "Admins update media bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'media'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
)
with check (
  bucket_id = 'media'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
      and user_roles.role in ('superadmin', 'admin')
  )
);
