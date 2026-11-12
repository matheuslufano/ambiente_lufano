-- Independent of the historical relational schema. One private workspace per account.
create table public.study_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.study_workspaces enable row level security;
create policy study_workspaces_owner on public.study_workspaces
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
revoke all on public.study_workspaces from anon;
grant select, insert, update on public.study_workspaces to authenticated;

-- Compare-and-swap prevents a stale device from replacing newer cloud data.
create function public.save_study_workspace(expected_revision bigint, workspace_state jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare next_revision bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if expected_revision = 0 then
    insert into public.study_workspaces(user_id, state)
    values (auth.uid(), workspace_state)
    on conflict (user_id) do nothing returning revision into next_revision;
  else
    update public.study_workspaces set state = workspace_state,
      revision = revision + 1, updated_at = now()
    where user_id = auth.uid() and revision = expected_revision
    returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'SYNC_CONFLICT'; end if;
  return next_revision;
end $$;
revoke all on function public.save_study_workspace(bigint, jsonb) from public, anon;
grant execute on function public.save_study_workspace(bigint, jsonb) to authenticated;
