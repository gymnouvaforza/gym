insert into public.system_modules (name, is_enabled, description)
values (
  'mobile',
  true,
  'Controla shell mobile, APIs /api/mobile y dashboard mobile.'
)
on conflict (name) do update
set
  is_enabled = excluded.is_enabled,
  description = excluded.description;
