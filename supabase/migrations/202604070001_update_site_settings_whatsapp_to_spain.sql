update public.site_settings
set
  contact_phone = '+34 654 19 47 88',
  whatsapp_url = 'https://wa.me/34654194788',
  updated_at = now()
where id = 1;
