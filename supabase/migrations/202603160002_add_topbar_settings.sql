alter table public.site_settings
add column if not exists topbar_enabled boolean not null default false,
add column if not exists topbar_variant text not null default 'announcement',
add column if not exists topbar_text text,
add column if not exists topbar_cta_label text,
add column if not exists topbar_cta_url text,
add column if not exists topbar_expires_at timestamptz;

alter table public.site_settings
drop constraint if exists site_settings_topbar_variant_check;

alter table public.site_settings
add constraint site_settings_topbar_variant_check
check (topbar_variant in ('announcement', 'promotion', 'notice'));

update public.site_settings
set
  topbar_enabled = coalesce(topbar_enabled, true),
  topbar_variant = coalesce(topbar_variant, 'promotion'),
  topbar_text = coalesce(topbar_text, 'Matricula gratis por tiempo limitado para nuevos socios.'),
  topbar_cta_label = coalesce(topbar_cta_label, 'Reserva tu prueba'),
  topbar_cta_url = coalesce(topbar_cta_url, '#contacto'),
  topbar_expires_at = coalesce(topbar_expires_at, timezone('utc', now()) + interval '30 day')
where id = 1;
