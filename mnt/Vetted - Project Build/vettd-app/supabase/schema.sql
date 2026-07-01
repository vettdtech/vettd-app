-- ============================================================
-- VETTD — Database Schema
-- Run this in Supabase → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('candidate', 'business')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- CANDIDATE PROFILES
-- ============================================================
create table if not exists public.candidate_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  first_name text,
  last_name text,
  headline text,
  bio text,
  location text,
  clearance_level text check (clearance_level in ('BPSS', 'SC', 'DV', 'TS', 'SCI')),
  clearance_verified boolean default false,
  disciplines text[] default '{}',
  years_experience integer,
  availability text check (availability in ('immediate', '1_month', '3_months', 'not_looking')),
  day_rate_min integer,
  day_rate_max integer,
  is_public boolean default true,
  avatar_url text,
  cv_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- BUSINESS PROFILES
-- ============================================================
create table if not exists public.business_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  company_name text not null,
  company_size text check (company_size in ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  sector text,
  website text,
  description text,
  logo_url text,
  is_verified boolean default false,
  plan text default 'trial' check (plan in ('trial', 'starter', 'pro', 'enterprise')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- JOB POSTINGS
-- ============================================================
create table if not exists public.job_postings (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  remote_ok boolean default false,
  clearance_required text check (clearance_required in ('BPSS', 'SC', 'DV', 'TS', 'SCI')),
  disciplines text[] default '{}',
  day_rate_min integer,
  day_rate_max integer,
  contract_length text,
  status text default 'draft' check (status in ('draft', 'active', 'closed', 'filled')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- APPLICATIONS / PIPELINE
-- ============================================================
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.job_postings(id) on delete cascade not null,
  candidate_id uuid references public.candidate_profiles(id) on delete cascade not null,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  stage text default 'proposal' check (stage in ('proposal', 'shortlisted', 'interviewing', 'hired', 'rejected', 'withdrawn')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(job_id, candidate_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

-- ============================================================
-- SAVED CANDIDATES (businesses bookmarking candidates)
-- ============================================================
create table if not exists public.saved_candidates (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  candidate_id uuid references public.candidate_profiles(id) on delete cascade not null,
  notes text,
  created_at timestamptz default now() not null,
  unique(business_id, candidate_id)
);

-- ============================================================
-- TEAM MEMBERS (multiple users per business)
-- ============================================================
create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  role text default 'recruiter' check (role in ('admin', 'recruiter', 'viewer')),
  status text default 'pending' check (status in ('active', 'pending')),
  created_at timestamptz default now() not null,
  unique(business_id, email)
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

drop trigger if exists candidate_profiles_updated_at on public.candidate_profiles;
create trigger candidate_profiles_updated_at before update on public.candidate_profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists business_profiles_updated_at on public.business_profiles;
create trigger business_profiles_updated_at before update on public.business_profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists job_postings_updated_at on public.job_postings;
create trigger job_postings_updated_at before update on public.job_postings
  for each row execute function public.handle_updated_at();

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at before update on public.applications
  for each row execute function public.handle_updated_at();

-- ============================================================
-- NEW USER HANDLER — creates users row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.job_postings enable row level security;
alter table public.applications enable row level security;
alter table public.messages enable row level security;
alter table public.saved_candidates enable row level security;
alter table public.team_members enable row level security;

-- Users
drop policy if exists "Users can view own record" on public.users;
create policy "Users can view own record" on public.users
  for select using (auth.uid() = id);

drop policy if exists "Users can update own record" on public.users;
create policy "Users can update own record" on public.users
  for update using (auth.uid() = id);

-- Candidate profiles
drop policy if exists "Candidates manage own profile" on public.candidate_profiles;
create policy "Candidates manage own profile" on public.candidate_profiles
  for all using (auth.uid() = user_id);

drop policy if exists "Businesses can view public candidate profiles" on public.candidate_profiles;
create policy "Businesses can view public candidate profiles" on public.candidate_profiles
  for select using (
    is_public = true
    and exists (
      select 1 from public.users where id = auth.uid() and role = 'business'
    )
  );

-- Business profiles
drop policy if exists "Businesses manage own profile" on public.business_profiles;
create policy "Businesses manage own profile" on public.business_profiles
  for all using (auth.uid() = user_id);

drop policy if exists "Candidates can view business profiles" on public.business_profiles;
create policy "Candidates can view business profiles" on public.business_profiles
  for select using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'candidate'
    )
  );

-- Job postings
drop policy if exists "Businesses manage own job postings" on public.job_postings;
create policy "Businesses manage own job postings" on public.job_postings
  for all using (
    exists (
      select 1 from public.business_profiles where id = business_id and user_id = auth.uid()
    )
  );

drop policy if exists "Candidates can view active job postings" on public.job_postings;
create policy "Candidates can view active job postings" on public.job_postings
  for select using (status = 'active');

-- Applications
drop policy if exists "Candidates manage own applications" on public.applications;
create policy "Candidates manage own applications" on public.applications
  for all using (
    exists (
      select 1 from public.candidate_profiles where id = candidate_id and user_id = auth.uid()
    )
  );

drop policy if exists "Businesses see applications for their jobs" on public.applications;
create policy "Businesses see applications for their jobs" on public.applications
  for all using (
    exists (
      select 1 from public.business_profiles where id = business_id and user_id = auth.uid()
    )
  );

-- Messages
drop policy if exists "Application parties can view messages" on public.messages;
create policy "Application parties can view messages" on public.messages
  for select using (
    exists (
      select 1 from public.applications a
      join public.candidate_profiles cp on cp.id = a.candidate_id
      join public.business_profiles bp on bp.id = a.business_id
      where a.id = application_id
        and (cp.user_id = auth.uid() or bp.user_id = auth.uid())
    )
  );

drop policy if exists "Application parties can send messages" on public.messages;
create policy "Application parties can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.applications a
      join public.candidate_profiles cp on cp.id = a.candidate_id
      join public.business_profiles bp on bp.id = a.business_id
      where a.id = application_id
        and (cp.user_id = auth.uid() or bp.user_id = auth.uid())
    )
  );

-- Saved candidates
drop policy if exists "Businesses manage saved candidates" on public.saved_candidates;
create policy "Businesses manage saved candidates" on public.saved_candidates
  for all using (
    exists (
      select 1 from public.business_profiles where id = business_id and user_id = auth.uid()
    )
  );

-- Team members
drop policy if exists "Business admins manage team" on public.team_members;
create policy "Business admins manage team" on public.team_members
  for all using (
    exists (
      select 1 from public.business_profiles where id = business_id and user_id = auth.uid()
    )
  );

drop policy if exists "Team members can view own record" on public.team_members;
create policy "Team members can view own record" on public.team_members
  for select using (user_id = auth.uid());
