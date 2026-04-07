create table if not exists public.pickup_request_annotations (
  id uuid primary key default gen_random_uuid(),
  pickup_request_id text not null references public.pickup_request (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  created_by_user_id text,
  created_by_email text,
  constraint pickup_request_annotations_content_check check (char_length(trim(content)) > 0)
);

create index if not exists pickup_request_annotations_pickup_request_id_idx
  on public.pickup_request_annotations (pickup_request_id, created_at desc);
