alter table public.site_settings
  add column if not exists custom_css text;

alter table public.site_settings
  alter column custom_css set default
  '/* Define tus reglas CSS aqui */\n:root {\n  --brand-primary: #d71920;\n  --radius-base: 0px;\n}'::text;

update public.site_settings
set custom_css = '/* Define tus reglas CSS aqui */' || E'\n:root {\n  --brand-primary: ' || coalesce(primary_color, '#d71920') || E';\n  --radius-base: 0px;\n}'
where custom_css is null;
