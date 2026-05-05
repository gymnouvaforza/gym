-- Migration: Create search_member_profiles function for safe reception search
-- This provides a robust alternative to PostgREST .or() string concatenation
-- which is vulnerable to parsing errors with special characters.

create or replace function public.search_member_profiles(search_query text)
returns setof public.member_profiles
language sql
security definer
set search_path = public
as $$
  select *
  from public.member_profiles
  where full_name ilike '%' || search_query || '%'
     or email ilike '%' || search_query || '%'
     or phone ilike '%' || search_query || '%'
     or member_number ilike '%' || search_query || '%'
     or external_code ilike '%' || search_query || '%'
  order by full_name asc
  limit 20;
$$;

-- Add comment for documentation
comment on function public.search_member_profiles(text) is 
'Searches member profiles by name, email, phone, member_number, or external_code.
Uses case-insensitive pattern matching (ilike) with wildcards.
Returns max 20 results ordered by full_name.
Security: runs as definer to bypass RLS for admin/service role access.';
