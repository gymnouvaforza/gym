alter table public.routine_templates
  add column if not exists slug text,
  add column if not exists difficulty_label text,
  add column if not exists notes text;

with prepared as (
  select
    id,
    coalesce(
      nullif(
        regexp_replace(
          regexp_replace(
            translate(lower(title), 'áéíóúüñ', 'aeiouun'),
            '[^a-z0-9]+',
            '-',
            'g'
          ),
          '(^-|-$)',
          '',
          'g'
        ),
        ''
      ),
      'rutina'
    ) as base_slug,
    row_number() over (
      partition by coalesce(
        nullif(
          regexp_replace(
            regexp_replace(
              translate(lower(title), 'áéíóúüñ', 'aeiouun'),
              '[^a-z0-9]+',
              '-',
              'g'
            ),
            '(^-|-$)',
            '',
            'g'
          ),
          ''
        ),
        'rutina'
      )
      order by created_at, id
    ) as slug_rank
  from public.routine_templates
  where slug is null or btrim(slug) = ''
)
update public.routine_templates as routine_templates
set slug = case
  when prepared.slug_rank = 1 then prepared.base_slug
  else prepared.base_slug || '-' || substring(routine_templates.id::text from 1 for 8)
end
from prepared
where routine_templates.id = prepared.id;

update public.routine_templates
set difficulty_label = coalesce(nullif(btrim(difficulty_label), ''), 'Media')
where difficulty_label is null or btrim(difficulty_label) = '';

alter table public.routine_templates
  alter column slug set not null,
  alter column difficulty_label set not null;

create unique index if not exists routine_templates_slug_idx
  on public.routine_templates(slug);
