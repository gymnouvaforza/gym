alter table public.site_settings
  add column if not exists theme_config jsonb;

alter table public.site_settings
  alter column theme_config set default
  '{"font":"Inter","colors":{"accent":"#f3f4f6","primary":"#d71920","secondary":"#111111","background":"#f5f5f0"},"radius":"0rem"}'::jsonb;

update public.site_settings
set theme_config = jsonb_build_object(
  'font', 'Inter',
  'colors', jsonb_build_object(
    'accent', '#f3f4f6',
    'primary', coalesce(primary_color, '#d71920'),
    'secondary', coalesce(secondary_color, '#111111'),
    'background', '#f5f5f0'
  ),
  'radius', '0rem'
)
where theme_config is null;
