-- Migration: Create form_drafts table for partial dashboard saving
-- Description: Stores incomplete form data for administrative users to allow progress saving.

create table if not exists public.form_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  form_key text not null, -- slug identifying the form (e.g. 'member-profile')
  record_id text not null, -- 'new' or the UUID of the record being edited
  payload jsonb not null, -- serialized form data
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  -- Prevent duplicate drafts per form/record for the same user
  unique(user_id, form_key, record_id)
);

-- Enable RLS
alter table public.form_drafts enable row level security;

comment on column public.form_drafts.user_id is
  'Stores external auth user id (Firebase or Supabase).';

-- Admin-only access for current authenticated identity
drop policy if exists "Admins can manage their own drafts" on public.form_drafts;
create policy "Admins can manage their own drafts"
  on public.form_drafts
  for all -- select, insert, update, delete
  to authenticated
  using (public.current_auth_user_id() = user_id)
  with check (public.current_auth_user_id() = user_id);

-- Update trigger for updated_at
drop trigger if exists set_form_drafts_updated_at on public.form_drafts;
create trigger set_form_drafts_updated_at
  before update on public.form_drafts
  for each row
  execute function public.handle_updated_at();

-- Index for searching drafts
create index if not exists form_drafts_user_form_idx on public.form_drafts(user_id, form_key);
