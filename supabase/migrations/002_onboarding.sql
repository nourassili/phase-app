-- Onboarding / consent columns for closed pilot.
-- Run in Supabase SQL Editor after 001_init.sql.

alter table public.profiles
  add column if not exists consented_at timestamptz,
  add column if not exists consent_version text,
  add column if not exists onboarding_completed_at timestamptz;
