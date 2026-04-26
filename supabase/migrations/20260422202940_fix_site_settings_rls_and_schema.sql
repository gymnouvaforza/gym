update public.site_settings
set theme_config = jsonb_build_object(
  'font', coalesce(theme_config ->> 'font', 'Inter'),
  'colors', jsonb_build_object(
    'accent', coalesce(theme_config -> 'colors' ->> 'accent', '#f3f4f6'),
    'primary', coalesce(theme_config -> 'colors' ->> 'primary', primary_color, '#d71920'),
    'secondary', coalesce(theme_config -> 'colors' ->> 'secondary', secondary_color, '#111111'),
    'background', coalesce(theme_config -> 'colors' ->> 'background', '#f5f5f0')
  ),
  'radius', coalesce(theme_config ->> 'radius', '0rem')
)
where theme_config is not null;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
on public.site_settings
for select
using (true);

drop policy if exists "Admins can update site_settings" on public.site_settings;
create policy "Admins can update site_settings"
on public.site_settings
for update
to authenticated
using (true)
with check (true);
