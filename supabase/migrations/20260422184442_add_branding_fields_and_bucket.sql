alter table public.site_settings
  add column if not exists logo_url text,
  add column if not exists favicon_url text,
  add column if not exists primary_color text default '#d71920',
  add column if not exists secondary_color text default '#111111',
  add column if not exists slogan text;

update public.site_settings
set
  primary_color = coalesce(primary_color, '#d71920'),
  secondary_color = coalesce(secondary_color, '#111111')
where primary_color is null
   or secondary_color is null;

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "Public Read Access" on storage.objects;
create policy "Public Read Access"
on storage.objects
for select
to public
using (bucket_id = 'branding');

drop policy if exists "Admin CRUD Access" on storage.objects;
create policy "Admin CRUD Access"
on storage.objects
for all
to authenticated
using (bucket_id = 'branding')
with check (bucket_id = 'branding');
