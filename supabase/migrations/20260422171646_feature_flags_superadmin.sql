alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('superadmin', 'admin', 'trainer', 'app_blocked'));

comment on constraint user_roles_role_check on public.user_roles is
  'Roles permitidos: superadmin, admin, trainer, app_blocked';

create table if not exists public.system_modules (
  id bigint generated always as identity primary key,
  name text not null unique,
  is_enabled boolean not null default true,
  description text,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.system_modules enable row level security;

drop trigger if exists set_system_modules_updated_at on public.system_modules;
create trigger set_system_modules_updated_at
  before update on public.system_modules
  for each row
  execute function public.handle_updated_at();

insert into public.system_modules (name, is_enabled, description)
values
  ('tienda', true, 'Controla tienda publica, carrito pickup y dashboard commerce.'),
  ('rutinas', true, 'Controla editor y gestion de rutinas desde dashboard.'),
  ('leads', true, 'Controla bandeja comercial y widgets de captacion.'),
  ('marketing', true, 'Controla modulo operativo de marketing en dashboard.'),
  ('cms', true, 'Controla editor ligero de textos legales y sistema.')
on conflict (name) do update
set
  is_enabled = excluded.is_enabled,
  description = excluded.description;

drop policy if exists "Staff can read system modules" on public.system_modules;
create policy "Staff can read system modules"
  on public.system_modules
  for select
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role in ('superadmin', 'admin', 'trainer')
    )
  );

drop policy if exists "Superadmins can insert system modules" on public.system_modules;
create policy "Superadmins can insert system modules"
  on public.system_modules
  for insert
  with check (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role = 'superadmin'
    )
  );

drop policy if exists "Superadmins can update system modules" on public.system_modules;
create policy "Superadmins can update system modules"
  on public.system_modules
  for update
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role = 'superadmin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role = 'superadmin'
    )
  );

drop policy if exists "Superadmins can delete system modules" on public.system_modules;
create policy "Superadmins can delete system modules"
  on public.system_modules
  for delete
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()::text
        and user_roles.role = 'superadmin'
    )
  );

drop policy if exists "Admin insert routine-assets commerce buckets" on storage.objects;
create policy "Admin insert routine-assets commerce buckets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('routine-assets', 'product-images', 'commerce-media')
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin')
  )
);

drop policy if exists "Admin update routine-assets commerce buckets" on storage.objects;
create policy "Admin update routine-assets commerce buckets"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('routine-assets', 'product-images', 'commerce-media')
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin')
  )
)
with check (
  bucket_id in ('routine-assets', 'product-images', 'commerce-media')
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin')
  )
);

drop policy if exists "Admins and Staff can manage memberships" on public.memberships;
create policy "Admins and Staff can manage memberships"
on public.memberships
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin', 'trainer')
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin', 'trainer')
  )
);

drop policy if exists "Admins and Staff can manage member_payments" on public.member_payments;
create policy "Admins and Staff can manage member_payments"
on public.member_payments
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin', 'trainer')
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin', 'trainer')
  )
);

drop policy if exists "Admins and Staff can manage member_measurements" on public.member_measurements;
create policy "Admins and Staff can manage member_measurements"
on public.member_measurements
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin', 'trainer')
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()::text
      and user_roles.role in ('superadmin', 'admin', 'trainer')
  )
);
