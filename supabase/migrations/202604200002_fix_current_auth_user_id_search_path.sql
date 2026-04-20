create or replace function public.current_auth_user_id()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt()->>'sub', nullif(auth.uid()::text, ''))
$$;

comment on function public.current_auth_user_id() is
  'Resuelve el identificador del proveedor de auth activo (Firebase o Supabase).';
