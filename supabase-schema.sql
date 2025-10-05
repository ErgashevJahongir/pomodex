-- ============================================
-- POMODEX DATABASE SCHEMA
-- ============================================
-- Bu script'ni Supabase SQL Editor'da run qiling
-- Dashboard → SQL Editor → New Query
-- ============================================

-- 1. TIMER SESSIONS TABLE
-- Har bir pomodoro/break sessiyasini saqlash
create table if not exists timer_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mode text not null check (mode in ('pomodoro', 'short_break', 'long_break')),
  duration integer not null, -- seconds
  completed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Index for faster queries
create index if not exists timer_sessions_user_id_idx on timer_sessions(user_id);
create index if not exists timer_sessions_completed_at_idx on timer_sessions(completed_at);

-- 2. USER SETTINGS TABLE
-- Har bir user uchun shaxsiy sozlamalar
create table if not exists user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  pomodoro_duration integer default 25 check (pomodoro_duration > 0),
  short_break_duration integer default 5 check (short_break_duration > 0),
  long_break_duration integer default 15 check (long_break_duration > 0),
  auto_start_breaks boolean default false,
  auto_start_pomodoros boolean default false,
  long_break_interval integer default 4 check (long_break_interval > 0),
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Index
create index if not exists user_settings_user_id_idx on user_settings(user_id);

-- 3. DAILY STATISTICS TABLE
-- Kunlik statistika
create table if not exists daily_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  completed_pomodoros integer default 0,
  total_focus_time integer default 0, -- seconds
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Index
create index if not exists daily_stats_user_id_idx on daily_stats(user_id);
create index if not exists daily_stats_date_idx on daily_stats(date);

-- 4. TASKS TABLE
-- Vazifalar ro'yxati
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  pomodoros_count integer default 0,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- Index
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_order_idx on tasks(user_id, order_index);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Har bir user faqat o'z ma'lumotlarini ko'radi

-- Enable RLS
alter table timer_sessions enable row level security;
alter table user_settings enable row level security;
alter table daily_stats enable row level security;
alter table tasks enable row level security;

-- TIMER SESSIONS POLICIES
create policy "Users can view own timer sessions"
  on timer_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own timer sessions"
  on timer_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own timer sessions"
  on timer_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own timer sessions"
  on timer_sessions for delete
  using (auth.uid() = user_id);

-- USER SETTINGS POLICIES
create policy "Users can view own settings"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on user_settings for update
  using (auth.uid() = user_id);

-- DAILY STATS POLICIES
create policy "Users can view own stats"
  on daily_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on daily_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on daily_stats for update
  using (auth.uid() = user_id);

-- TASKS POLICIES
create policy "Users can view own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for user_settings
create trigger update_user_settings_updated_at
  before update on user_settings
  for each row
  execute function update_updated_at_column();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- User qo'shilganda avtomatik settings yaratish
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- Agar xato yo'q bo'lsa, hammasi tayyor! ✅

