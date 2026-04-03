alter table public.routine_assignments
  add column if not exists recommended_schedule_label text;

create unique index if not exists routine_assignments_id_member_idx
  on public.routine_assignments(id, member_id);

create table if not exists public.member_routine_feedback (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  routine_assignment_id uuid not null,
  liked boolean not null default false,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint member_routine_feedback_note_check check (note is null or char_length(note) <= 280),
  constraint member_routine_feedback_assignment_member_fkey
    foreign key (routine_assignment_id, member_id)
    references public.routine_assignments(id, member_id)
    on delete cascade
);

create unique index if not exists member_routine_feedback_member_assignment_idx
  on public.member_routine_feedback(member_id, routine_assignment_id);

create index if not exists member_routine_feedback_assignment_idx
  on public.member_routine_feedback(routine_assignment_id);

alter table public.member_routine_feedback enable row level security;

drop policy if exists "Members can read own routine feedback" on public.member_routine_feedback;
create policy "Members can read own routine feedback"
  on public.member_routine_feedback
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop policy if exists "Members can insert own routine feedback" on public.member_routine_feedback;
create policy "Members can insert own routine feedback"
  on public.member_routine_feedback
  for insert
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop policy if exists "Members can update own routine feedback" on public.member_routine_feedback;
create policy "Members can update own routine feedback"
  on public.member_routine_feedback
  for update
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop trigger if exists set_member_routine_feedback_updated_at on public.member_routine_feedback;
create trigger set_member_routine_feedback_updated_at
  before update on public.member_routine_feedback
  for each row
  execute function public.handle_updated_at();

create table if not exists public.member_routine_exercise_feedback (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  routine_assignment_id uuid not null,
  routine_template_exercise_id uuid not null references public.routine_template_exercises(id) on delete cascade,
  liked boolean not null default false,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint member_routine_exercise_feedback_note_check check (note is null or char_length(note) <= 280),
  constraint member_routine_exercise_feedback_assignment_member_fkey
    foreign key (routine_assignment_id, member_id)
    references public.routine_assignments(id, member_id)
    on delete cascade
);

create unique index if not exists member_routine_exercise_feedback_unique_idx
  on public.member_routine_exercise_feedback(member_id, routine_assignment_id, routine_template_exercise_id);

create index if not exists member_routine_exercise_feedback_assignment_idx
  on public.member_routine_exercise_feedback(routine_assignment_id);

create or replace function public.validate_member_routine_exercise_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_template_id uuid;
  exercise_template_id uuid;
begin
  select routine_template_id
  into assignment_template_id
  from public.routine_assignments
  where id = new.routine_assignment_id
    and member_id = new.member_id;

  if assignment_template_id is null then
    raise exception 'Routine assignment/member mismatch for exercise feedback.';
  end if;

  select blocks.routine_template_id
  into exercise_template_id
  from public.routine_template_exercises as exercises
  join public.routine_template_blocks as blocks
    on blocks.id = exercises.routine_block_id
  where exercises.id = new.routine_template_exercise_id;

  if exercise_template_id is null then
    raise exception 'Routine exercise not found.';
  end if;

  if exercise_template_id <> assignment_template_id then
    raise exception 'Routine exercise does not belong to the active assignment.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_member_routine_exercise_feedback on public.member_routine_exercise_feedback;
create trigger validate_member_routine_exercise_feedback
  before insert or update on public.member_routine_exercise_feedback
  for each row
  execute function public.validate_member_routine_exercise_feedback();

alter table public.member_routine_exercise_feedback enable row level security;

drop policy if exists "Members can read own routine exercise feedback" on public.member_routine_exercise_feedback;
create policy "Members can read own routine exercise feedback"
  on public.member_routine_exercise_feedback
  for select
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop policy if exists "Members can insert own routine exercise feedback" on public.member_routine_exercise_feedback;
create policy "Members can insert own routine exercise feedback"
  on public.member_routine_exercise_feedback
  for insert
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop policy if exists "Members can update own routine exercise feedback" on public.member_routine_exercise_feedback;
create policy "Members can update own routine exercise feedback"
  on public.member_routine_exercise_feedback
  for update
  using (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.member_profiles
      where member_profiles.id = member_routine_exercise_feedback.member_id
        and member_profiles.supabase_user_id = auth.uid()
    )
  );

drop trigger if exists set_member_routine_exercise_feedback_updated_at on public.member_routine_exercise_feedback;
create trigger set_member_routine_exercise_feedback_updated_at
  before update on public.member_routine_exercise_feedback
  for each row
  execute function public.handle_updated_at();
