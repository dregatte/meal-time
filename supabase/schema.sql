-- Run this entire file in Supabase Dashboard → SQL Editor

-- ─────────────────────────────────────────
-- Profiles (auto-created on first sign-in)
-- ─────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  email text,
  created_at timestamptz default now()
);

-- Auto-create profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────
-- Recipes (shared family library)
-- ─────────────────────────────────────────
create table if not exists recipes (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  ingredients jsonb not null default '[]',
  method jsonb not null default '[]',
  prep_mins int default 0,
  cook_mins int default 0,
  servings int default 2,
  photo_url text,
  tags text[] default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- Inventory (per user)
-- ─────────────────────────────────────────
create table if not exists inventory_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  quantity text,
  status text default 'in_stock' check (status in ('in_stock', 'to_buy')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- Week Slots (per user)
-- ─────────────────────────────────────────
create table if not exists week_slots (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  week_start date not null,
  day text not null check (day in ('mon','tue','wed','thu','fri','sat','sun')),
  meal text not null check (meal in ('lunch','dinner')),
  recipe_id bigint references recipes(id) on delete set null,
  note text,
  unique(user_id, week_start, day, meal)
);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table profiles enable row level security;
alter table recipes enable row level security;
alter table inventory_items enable row level security;
alter table week_slots enable row level security;

-- Profiles: users can read/update their own
create policy "profiles: own read" on profiles for select using (auth.uid() = id);
create policy "profiles: own update" on profiles for update using (auth.uid() = id);

-- Recipes: all authenticated users can read; owner can insert/update/delete
create policy "recipes: authenticated read" on recipes for select to authenticated using (true);
create policy "recipes: own insert" on recipes for insert to authenticated with check (auth.uid() = created_by);
create policy "recipes: own update" on recipes for update to authenticated using (auth.uid() = created_by);
create policy "recipes: own delete" on recipes for delete to authenticated using (auth.uid() = created_by);

-- Inventory: fully private per user
create policy "inventory: own all" on inventory_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Week slots: fully private per user
create policy "week_slots: own all" on week_slots for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- Storage bucket for recipe photos
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

create policy "recipe photos: public read" on storage.objects for select using (bucket_id = 'recipe-photos');
create policy "recipe photos: auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'recipe-photos');
create policy "recipe photos: own delete" on storage.objects for delete to authenticated using (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);
