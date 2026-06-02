-- Pomodoro work sessions (RLS enforced; client inserts use auth.uid())

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  completed_at timestamptz not null default now(),
  duration_seconds integer not null check (duration_seconds > 0),
  task_label text not null default ''
);

comment on table public.pomodoro_sessions is 'Completed Pomodoro work blocks; breaks are not stored.';

create index if not exists pomodoro_sessions_user_completed_idx
  on public.pomodoro_sessions (user_id, completed_at desc);

create index if not exists pomodoro_sessions_user_started_idx
  on public.pomodoro_sessions (user_id, started_at desc);

alter table public.pomodoro_sessions enable row level security;

create policy "Users can view own pomodoro sessions"
  on public.pomodoro_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own pomodoro sessions"
  on public.pomodoro_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);
