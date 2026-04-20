create or replace function public.current_auth_user_id()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt()->>'sub', nullif(auth.uid()::text, ''))
$$;

comment on function public.current_auth_user_id() is
  'Resuelve el identificador del proveedor de auth activo (Firebase o Supabase).';

-- Soltamos primero las policies dependientes para poder alterar columnas
-- usadas por RLS sin que Postgres bloquee la migracion.
drop policy if exists "Los miembros pueden ver su propia vinculacion commerce" on public.member_commerce_customers;
drop policy if exists "Users can read own roles" on public.user_roles;
drop policy if exists "Users can read own trainer profile" on public.trainer_profiles;
drop policy if exists "Members can read own profile" on public.member_profiles;
drop policy if exists "Members can read own plan snapshots" on public.member_plan_snapshots;
drop policy if exists "Members can read own routine assignments" on public.routine_assignments;
drop policy if exists "Members can read own routine feedback" on public.member_routine_feedback;
drop policy if exists "Members can insert own routine feedback" on public.member_routine_feedback;
drop policy if exists "Members can update own routine feedback" on public.member_routine_feedback;
drop policy if exists "Members can read own routine exercise feedback" on public.member_routine_exercise_feedback;
drop policy if exists "Members can insert own routine exercise feedback" on public.member_routine_exercise_feedback;
drop policy if exists "Members can update own routine exercise feedback" on public.member_routine_exercise_feedback;
drop policy if exists "marketing_testimonials member read own" on public.marketing_testimonials;
drop policy if exists "marketing_testimonials member insert own" on public.marketing_testimonials;
drop policy if exists "marketing_testimonials member update own" on public.marketing_testimonials;
drop policy if exists "Members can read own membership requests" on public.membership_requests;
drop policy if exists "Members can read own membership payment entries" on public.membership_payment_entries;
drop policy if exists "Admin insert routine-assets and product-images" on storage.objects;
drop policy if exists "Admin update routine-assets and product-images" on storage.objects;
drop policy if exists "Admin insert routine-assets commerce buckets" on storage.objects;
drop policy if exists "Admin update routine-assets commerce buckets" on storage.objects;

alter table if exists public.member_commerce_customers
  drop constraint if exists member_commerce_customers_supabase_user_id_fkey;

alter table if exists public.user_roles
  drop constraint if exists user_roles_user_id_fkey,
  drop constraint if exists user_roles_assigned_by_fkey;

alter table if exists public.trainer_profiles
  drop constraint if exists trainer_profiles_user_id_fkey;

alter table if exists public.member_profiles
  drop constraint if exists member_profiles_supabase_user_id_fkey,
  drop constraint if exists member_profiles_trainer_user_id_fkey;

alter table if exists public.routine_templates
  drop constraint if exists routine_templates_trainer_user_id_fkey,
  drop constraint if exists routine_templates_created_by_fkey;

alter table if exists public.routine_assignments
  drop constraint if exists routine_assignments_trainer_user_id_fkey,
  drop constraint if exists routine_assignments_assigned_by_user_id_fkey;

alter table if exists public.membership_requests
  drop constraint if exists membership_requests_supabase_user_id_fkey;

alter table if exists public.membership_request_annotations
  drop constraint if exists membership_request_annotations_created_by_user_id_fkey;

alter table if exists public.membership_payment_entries
  drop constraint if exists membership_payment_entries_created_by_user_id_fkey;

alter table if exists public.membership_qr_scan_events
  drop constraint if exists membership_qr_scan_events_staff_user_id_fkey;

alter table if exists public.member_commerce_customers
  alter column supabase_user_id type text using supabase_user_id::text;

alter table if exists public.user_roles
  alter column user_id type text using user_id::text,
  alter column assigned_by type text using assigned_by::text;

alter table if exists public.trainer_profiles
  alter column user_id type text using user_id::text;

alter table if exists public.member_profiles
  alter column supabase_user_id type text using supabase_user_id::text,
  alter column trainer_user_id type text using trainer_user_id::text;

alter table if exists public.routine_templates
  alter column trainer_user_id type text using trainer_user_id::text,
  alter column created_by type text using created_by::text;

alter table if exists public.routine_assignments
  alter column trainer_user_id type text using trainer_user_id::text,
  alter column assigned_by_user_id type text using assigned_by_user_id::text;

alter table if exists public.marketing_testimonials
  alter column supabase_user_id type text using supabase_user_id::text;

alter table if exists public.membership_requests
  alter column supabase_user_id type text using supabase_user_id::text;

alter table if exists public.membership_request_annotations
  alter column created_by_user_id type text using created_by_user_id::text;

alter table if exists public.membership_payment_entries
  alter column created_by_user_id type text using created_by_user_id::text;

alter table if exists public.membership_qr_scan_events
  alter column staff_user_id type text using staff_user_id::text;

comment on column public.member_commerce_customers.supabase_user_id is
  'Legacy column name. Now stores the external auth user id (Firebase or Supabase).';

comment on column public.member_profiles.supabase_user_id is
  'Legacy column name. Now stores the external auth user id (Firebase or Supabase).';

comment on column public.marketing_testimonials.supabase_user_id is
  'Legacy column name. Now stores the external auth user id (Firebase or Supabase).';

comment on column public.membership_requests.supabase_user_id is
  'Legacy column name. Now stores the external auth user id (Firebase or Supabase).';

drop policy if exists "Los miembros pueden ver su propia vinculacion commerce" on public.member_commerce_customers;
create policy "Los miembros pueden ver su propia vinculacion commerce"
  on public.member_commerce_customers
  for select
  using (public.current_auth_user_id() = supabase_user_id);

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles
  for select
  using (public.current_auth_user_id() = user_id);

drop policy if exists "Users can read own trainer profile" on public.trainer_profiles;
create policy "Users can read own trainer profile"
  on public.trainer_profiles
  for select
  using (public.current_auth_user_id() = user_id);

drop policy if exists "Members can read own profile" on public.member_profiles;
create policy "Members can read own profile"
  on public.member_profiles
  for select
  using (public.current_auth_user_id() = supabase_user_id);

drop policy if exists "Members can read own plan snapshots" on public.member_plan_snapshots;
create policy "Members can read own plan snapshots"
  on public.member_plan_snapshots
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_plan_snapshots.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can read own routine assignments" on public.routine_assignments;
create policy "Members can read own routine assignments"
  on public.routine_assignments
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = routine_assignments.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can read own routine feedback" on public.member_routine_feedback;
create policy "Members can read own routine feedback"
  on public.member_routine_feedback
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can insert own routine feedback" on public.member_routine_feedback;
create policy "Members can insert own routine feedback"
  on public.member_routine_feedback
  for insert
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can update own routine feedback" on public.member_routine_feedback;
create policy "Members can update own routine feedback"
  on public.member_routine_feedback
  for update
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can read own routine exercise feedback" on public.member_routine_exercise_feedback;
create policy "Members can read own routine exercise feedback"
  on public.member_routine_exercise_feedback
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can insert own routine exercise feedback" on public.member_routine_exercise_feedback;
create policy "Members can insert own routine exercise feedback"
  on public.member_routine_exercise_feedback
  for insert
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can update own routine exercise feedback" on public.member_routine_exercise_feedback;
create policy "Members can update own routine exercise feedback"
  on public.member_routine_exercise_feedback
  for update
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "marketing_testimonials member read own" on public.marketing_testimonials;
create policy "marketing_testimonials member read own"
on public.marketing_testimonials
for select
to authenticated
using (public.current_auth_user_id() = supabase_user_id);

drop policy if exists "marketing_testimonials member insert own" on public.marketing_testimonials;
create policy "marketing_testimonials member insert own"
on public.marketing_testimonials
for insert
to authenticated
with check (public.current_auth_user_id() = supabase_user_id);

drop policy if exists "marketing_testimonials member update own" on public.marketing_testimonials;
create policy "marketing_testimonials member update own"
on public.marketing_testimonials
for update
to authenticated
using (public.current_auth_user_id() = supabase_user_id)
with check (public.current_auth_user_id() = supabase_user_id);

drop policy if exists "Members can read own membership requests" on public.membership_requests;
create policy "Members can read own membership requests"
  on public.membership_requests
  for select
  using (
    public.current_auth_user_id() = supabase_user_id
    or exists (
      select 1
      from public.member_profiles
      where member_profiles.id = membership_requests.member_id
        and member_profiles.supabase_user_id = public.current_auth_user_id()
    )
  );

drop policy if exists "Members can read own membership payment entries" on public.membership_payment_entries;
create policy "Members can read own membership payment entries"
  on public.membership_payment_entries
  for select
  using (
    exists (
      select 1
      from public.membership_requests
      where membership_requests.id = membership_payment_entries.membership_request_id
        and (
          membership_requests.supabase_user_id = public.current_auth_user_id()
          or exists (
            select 1
            from public.member_profiles
            where member_profiles.id = membership_requests.member_id
              and member_profiles.supabase_user_id = public.current_auth_user_id()
          )
        )
    )
  );

drop policy if exists "Admin insert routine-assets and product-images" on storage.objects;
drop policy if exists "Admin insert routine-assets commerce buckets" on storage.objects;
create policy "Admin insert routine-assets commerce buckets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('routine-assets', 'product-images', 'medusa-media')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = public.current_auth_user_id()
        and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admin update routine-assets and product-images" on storage.objects;
drop policy if exists "Admin update routine-assets commerce buckets" on storage.objects;
create policy "Admin update routine-assets commerce buckets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('routine-assets', 'product-images', 'medusa-media')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = public.current_auth_user_id()
        and user_roles.role = 'admin'
    )
  )
  with check (
    bucket_id in ('routine-assets', 'product-images', 'medusa-media')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = public.current_auth_user_id()
        and user_roles.role = 'admin'
    )
  );
