-- Migración: Endurecimiento de RLS y Unificación de Identidad (Firebase/Supabase)
-- Nova Forza Gym - Security Audit Phase

-- 1. Helper robusto para identificar staff (Admin/Trainer/Superadmin)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_roles.user_id = public.current_auth_user_id()
    and user_roles.role in ('admin', 'trainer', 'superadmin')
  );
$$;

comment on function public.is_staff() is 'Verifica si el usuario actual tiene rol de staff (admin, trainer o superadmin).';

-- 2. Endurecer LEADS
alter table public.leads enable row level security;
drop policy if exists "Public insert leads" on public.leads;
create policy "Public insert leads" on public.leads for insert with check (true);
drop policy if exists "Staff manage leads" on public.leads;
create policy "Staff manage leads" on public.leads for all using (public.is_staff());

-- 3. Endurecer USER_ROLES (Protección contra escalada de privilegios)
alter table public.user_roles enable row level security;
drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles" on public.user_roles for select using (public.current_auth_user_id() = user_id);
drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles" on public.user_roles for all using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = public.current_auth_user_id()
    and ur.role in ('admin', 'superadmin')
  )
);

-- 4. Endurecer MEMBER_PROFILES
alter table public.member_profiles enable row level security;
drop policy if exists "Members can read own profile" on public.member_profiles;
create policy "Members can read own profile" on public.member_profiles for select using (public.current_auth_user_id() = supabase_user_id);
drop policy if exists "Staff manage members" on public.member_profiles;
create policy "Staff manage members" on public.member_profiles for all using (public.is_staff());

-- 5. Endurecer ROUTINE_TEMPLATES (Proteger propiedad intelectual)
alter table public.routine_templates enable row level security;
drop policy if exists "Authenticated users can read active routine templates" on public.routine_templates;
create policy "Staff can read all templates" on public.routine_templates for select using (public.is_staff());
create policy "Assigned members can read templates" on public.routine_templates for select using (
  exists (
    select 1 from public.routine_assignments ra
    join public.member_profiles mp on mp.id = ra.member_id
    where ra.routine_template_id = public.routine_templates.id
    and mp.supabase_user_id = public.current_auth_user_id()
    and ra.status = 'active'
  )
);

-- 6. Corregir politicas financieras (Eliminar dependencia de auth.uid() UUID bug con Firebase)
alter table public.memberships enable row level security;
drop policy if exists "Admins and Staff can manage memberships" on public.memberships;
create policy "Staff manage memberships" on public.memberships for all using (public.is_staff());
create policy "Members read own memberships" on public.memberships for select using (
  exists (
    select 1 from public.member_profiles mp
    where mp.id = public.memberships.member_id
    and mp.supabase_user_id = public.current_auth_user_id()
  )
);

alter table public.member_payments enable row level security;
drop policy if exists "Admins and Staff can manage member_payments" on public.member_payments;
create policy "Staff manage payments" on public.member_payments for all using (public.is_staff());
create policy "Members read own payments" on public.member_payments for select using (
  exists (
    select 1 from public.memberships m
    join public.member_profiles mp on mp.id = m.member_id
    where m.id = public.member_payments.membership_id
    and mp.supabase_user_id = public.current_auth_user_id()
  )
);

alter table public.member_measurements enable row level security;
drop policy if exists "Admins and Staff can manage member_measurements" on public.member_measurements;
create policy "Staff manage measurements" on public.member_measurements for all using (public.is_staff());
create policy "Members read own measurements" on public.member_measurements for select using (
  exists (
    select 1 from public.member_profiles mp
    where mp.id = public.member_measurements.member_id
    and mp.supabase_user_id = public.current_auth_user_id()
  )
);

-- 7. Asegurar SITE_SETTINGS
alter table public.site_settings enable row level security;
drop policy if exists "Cualquiera lee settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select using (true);
drop policy if exists "Staff manage site_settings" on public.site_settings;
create policy "Staff manage site_settings" on public.site_settings for all using (public.is_staff());
