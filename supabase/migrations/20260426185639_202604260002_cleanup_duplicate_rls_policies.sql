-- Limpieza post-hardening de policies RLS duplicadas o demasiado amplias.
-- Mantiene un set canonico de policies antes de promover a produccion.

drop policy if exists "leads public insert" on public.leads;

drop policy if exists "site_settings public read" on public.site_settings;
drop policy if exists "Admins can update site_settings" on public.site_settings;
