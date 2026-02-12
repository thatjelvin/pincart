-- PinCart AI — Supabase Schema
-- Run this in Supabase SQL Editor

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  store_name text default 'My Store',
  plan_tier text default 'free' check (plan_tier in ('free', 'starter', 'pro')),
  stripe_customer_id text,
  searches_used integer default 0,
  generations_used numeric default 0,
  usage_reset_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Searches table
create table public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  keyword text not null,
  region text default 'global',
  results_json jsonb,
  created_at timestamp with time zone default now()
);

-- Generated pages table
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_name text not null,
  supplier_data jsonb,
  generated_copy jsonb,
  tone_preset text default 'standard',
  created_at timestamp with time zone default now()
);

-- Exports table
create table public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  generation_id uuid references public.generations(id) on delete set null,
  csv_url text,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.searches enable row level security;
alter table public.generations enable row level security;
alter table public.exports enable row level security;

-- Policies: users can only access their own data
create policy "Users read own" on public.users for select using (auth.uid() = id);
create policy "Users update own" on public.users for update using (auth.uid() = id);

create policy "Searches read own" on public.searches for select using (auth.uid() = user_id);
create policy "Searches insert own" on public.searches for insert with check (auth.uid() = user_id);

create policy "Generations read own" on public.generations for select using (auth.uid() = user_id);
create policy "Generations insert own" on public.generations for insert with check (auth.uid() = user_id);

create policy "Exports read own" on public.exports for select using (auth.uid() = user_id);
create policy "Exports insert own" on public.exports for insert with check (auth.uid() = user_id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
