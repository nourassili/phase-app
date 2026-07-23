-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates Thread tables + row-level security so each user only sees her own rows.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stage text,
  symptoms jsonb not null default '[]'::jsonb,
  triggers jsonb not null default '[]'::jsonb,
  helps jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_entries (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  mood text,
  sleep_quality text,
  symptoms jsonb not null default '[]'::jsonb,
  primary key (user_id, date)
);

create table if not exists public.conversation_messages (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  display_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversation_messages_user_created
  on public.conversation_messages (user_id, created_at);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;
alter table public.conversation_messages enable row level security;

drop policy if exists "profiles_own_rows" on public.profiles;
create policy "profiles_own_rows" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "daily_entries_own_rows" on public.daily_entries;
create policy "daily_entries_own_rows" on public.daily_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "conversation_messages_own_rows" on public.conversation_messages;
create policy "conversation_messages_own_rows" on public.conversation_messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
