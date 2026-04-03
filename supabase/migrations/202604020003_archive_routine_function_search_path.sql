create or replace function public.archive_previous_active_routine_assignments()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.status <> 'active' then
    return new;
  end if;

  update public.routine_assignments
  set
    status = 'archived',
    ends_on = coalesce(ends_on, coalesce(new.starts_on, current_date))
  where member_id = new.member_id
    and status = 'active'
    and id is distinct from new.id;

  return new;
end;
$function$;
