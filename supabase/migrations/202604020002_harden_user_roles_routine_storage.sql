alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('admin', 'trainer', 'app_blocked'));

comment on column public.user_roles.role is
  'Roles permitidos: admin, trainer, app_blocked';

create or replace function public.archive_previous_active_routine_assignments()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.status <> 'active' then
    return new;
  end if;

  update public.routine_assignments
  set
    status = 'archived',
    ends_on = coalesce(ends_on, coalesce(new.starts_on, current_date))
  where member_id = new.member_id
    and status = 'active'
    and id is distinct from new.id;

  return new;
end;
$function$;

drop trigger if exists archive_previous_active_routine_assignments on public.routine_assignments;

create trigger archive_previous_active_routine_assignments
  before insert or update of member_id, status, starts_on
  on public.routine_assignments
  for each row
  execute function public.archive_previous_active_routine_assignments();

insert into storage.buckets (id, name, public)
values
  ('routine-assets', 'routine-assets', true),
  ('product-images', 'product-images', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "Public read routine-assets and product-images" on storage.objects;
create policy "Public read routine-assets and product-images"
  on storage.objects
  for select
  to public
  using (bucket_id in ('routine-assets', 'product-images'));

drop policy if exists "Admin insert routine-assets and product-images" on storage.objects;
create policy "Admin insert routine-assets and product-images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('routine-assets', 'product-images')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admin update routine-assets and product-images" on storage.objects;
create policy "Admin update routine-assets and product-images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('routine-assets', 'product-images')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  )
  with check (
    bucket_id in ('routine-assets', 'product-images')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );
