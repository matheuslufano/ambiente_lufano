-- Espaço de Estudo Lufano: schema alinhado ao estado atual da aplicação.
-- Apply with `supabase db push` after linking an empty/approved Supabase project.
-- Every record is owned by auth.uid(); browser clients never use service_role.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  preferences jsonb not null default '{"theme":"light","dailyHours":3,"reduceMotion":false,"wallpaper":"desk","focusMinutes":25}'::jsonb,
  avatar_path text,
  wallpaper_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

-- The current UI has one active objective per account. Revisions keep an
-- ordinary UUID for joins while group/subject IDs preserve existing local keys.
create table public.study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  institution text not null default '',
  title text not null default '',
  role text not null default '',
  board text not null default '',
  exam_year integer check (exam_year between 1900 and 2200),
  salary text not null default '',
  exam_date date,
  emblem jsonb,
  edital_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.subject_groups (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  position integer not null default 0,
  primary key (user_id, id),
  unique (user_id, id, goal_id),
  foreign key (goal_id, user_id) references public.study_goals(id, user_id) on delete cascade
);

create table public.subjects (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  group_id text,
  name text not null check (length(trim(name)) > 0),
  color text not null default '#789078',
  target_hours numeric(8,2) not null default 0 check (target_hours >= 0),
  target_questions integer not null default 0 check (target_questions >= 0),
  syllabus_text text,
  position integer not null default 0,
  archived_at timestamptz,
  primary key (user_id, id),
  foreign key (goal_id, user_id) references public.study_goals(id, user_id) on delete cascade,
  foreign key (user_id, group_id, goal_id) references public.subject_groups(user_id, id, goal_id) on delete set null (group_id)
);

create table public.subject_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  title text not null check (length(trim(title)) > 0),
  position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);

create table public.study_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text,
  topic text not null default '',
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer not null check (duration_seconds >= 0),
  valid_intervals jsonb not null default '[]'::jsonb,
  question_count integer not null default 0 check (question_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0 and correct_count <= question_count),
  summary text not null default '',
  local_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete set null (subject_id)
);

-- An in-progress timer is private per user and can be restored after reconnecting.
create table public.active_study_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subject_id text,
  topic text not null default '',
  started_at timestamptz not null,
  accumulated_milliseconds bigint not null default 0 check (accumulated_milliseconds >= 0),
  running_since timestamptz,
  segments jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete set null (subject_id)
);

create table public.calendar_activities (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text,
  topic text not null default '',
  activity_date date not null,
  start_time time not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete set null (subject_id)
);

create table public.mock_exams (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  total_questions integer not null check (total_questions > 0),
  correct_answers integer not null check (correct_answers >= 0 and correct_answers <= total_questions),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.study_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  starts_on date not null,
  ends_on date not null,
  target_minutes integer not null check (target_minutes between 1 and 44640),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (user_id, subject_id, starts_on, ends_on),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);

create table public.study_cycle_entries (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  position integer not null check (position >= 0),
  target_minutes integer not null check (target_minutes between 1 and 480),
  created_at timestamptz not null default now(),
  unique (user_id, position),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
create table public.study_cycle_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  body_html text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);

create table public.flashcards (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  question text not null,
  answer text not null,
  due_at timestamptz not null default now(),
  interval_days integer not null default 0 check (interval_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);
create table public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null,
  rating smallint not null check (rating between 0 and 3),
  reviewed_at timestamptz not null default now(),
  foreign key (flashcard_id, user_id) references public.flashcards(id, user_id) on delete cascade
);

create table public.audio_notes (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  title text not null,
  recorded_at timestamptz not null,
  storage_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now(),
  foreign key (user_id, subject_id) references public.subjects(user_id, id) on delete cascade
);

create table public.study_posts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  body text not null check (length(trim(body)) > 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.user_shortcuts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  url text not null check (url ~ '^https://'),
  icon text not null check (icon in ('questions','courses','youtube','drive','site')),
  position integer not null default 0,
  primary key (user_id, id)
);

-- PET inventory and rewards are persisted in IndexedDB today; these rows are
-- ready for an explicit account-sync feature without coupling them to sessions.
create table public.pet_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.pet_rewards (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('study','daily','mock')),
  reward_date date not null,
  coins integer not null check (coins >= 0),
  xp integer not null check (xp >= 0),
  valid_seconds integer not null default 0 check (valid_seconds >= 0),
  message text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index study_sessions_user_started_idx on public.study_sessions(user_id, started_at desc);
create index study_sessions_user_subject_idx on public.study_sessions(user_id, subject_id, started_at desc);
create index calendar_activities_user_date_idx on public.calendar_activities(user_id, activity_date, start_time);
create index mock_exams_user_completed_idx on public.mock_exams(user_id, completed_at desc);
create index study_plans_user_period_idx on public.study_plans(user_id, starts_on, ends_on);
create index flashcards_user_due_idx on public.flashcards(user_id, due_at);
create index audio_notes_user_created_idx on public.audio_notes(user_id, created_at desc);
create index study_posts_user_updated_idx on public.study_posts(user_id, updated_at desc);
create index subject_topics_user_subject_position_idx on public.subject_topics(user_id, subject_id, position);

-- Every exposed application table is private to the authenticated owner.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'study_goals','subject_groups','subjects','subject_topics','study_sessions',
    'active_study_sessions','calendar_activities','mock_exams','study_plans',
    'study_cycle_entries','study_cycle_state','study_notes','flashcards',
    'flashcard_reviews','audio_notes','study_posts','user_shortcuts',
    'pet_states','pet_rewards'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_owner', table_name
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('revoke all on public.%I from anon', table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
create policy profiles_owner on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

-- Private bucket; all object paths must begin with the owner's auth UUID.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-files', 'study-files', false, 52428800,
  array['application/pdf','audio/webm','audio/ogg','audio/mp4','audio/mpeg','image/png','image/jpeg','image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
create policy study_files_owner_read on storage.objects
  for select to authenticated
  using (bucket_id = 'study-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy study_files_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'study-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy study_files_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'study-files' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'study-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy study_files_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'study-files' and (storage.foldername(name))[1] = (select auth.uid())::text);