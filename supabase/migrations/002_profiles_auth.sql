-- ── profiles: one row per Supabase auth user ─────────────────────────────────
-- Source of truth for username (globally unique, case-insensitive).
-- Both anonymous and real (OAuth) users get a profile row.

create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  username     text        not null,
  is_anonymous boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint profiles_username_unique unique (username),
  constraint profiles_username_length check (
    char_length(username) >= 3 and char_length(username) <= 30
  )
);

alter table public.profiles enable row level security;

-- Anyone can read profiles (required for username availability check).
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

-- Users can insert their own profile row.
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- Users can update their own profile row.
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());


-- ── username availability check ───────────────────────────────────────────────
-- Case-insensitive: "Nam" and "nam" are the same username.

create or replace function public.is_username_available(p_username text)
returns boolean language sql security definer stable as $$
  select not exists (
    select 1 from public.profiles
    where lower(username) = lower(p_username)
  );
$$;


-- ── upsert_profile ────────────────────────────────────────────────────────────
-- Security-definer so anonymous users (who bypass RLS checks in some configs)
-- can still write their own profile row.

create or replace function public.upsert_profile(
  p_user_id      uuid,
  p_username     text,
  p_is_anonymous boolean
) returns void language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, is_anonymous)
  values (p_user_id, p_username, p_is_anonymous)
  on conflict (id) do update
    set
      username     = excluded.username,
      is_anonymous = excluded.is_anonymous,
      updated_at   = now();
end;
$$;


-- ── relax old username constraint on user_scores ──────────────────────────────
-- The old constraint only allowed ASCII [a-zA-Z0-9_]{3,20}.
-- Username validation is now handled by profiles.username + app-level rules.

alter table public.user_scores drop constraint if exists username_format;


-- ── update leaderboard view ───────────────────────────────────────────────────
-- Pulls username from profiles (authoritative) instead of user_scores.

create or replace view public.leaderboard as
select
  p.username,
  s.overall_score,
  rank()   over (order by s.overall_score desc)::int as rank,
  count(*) over ()::int                              as total_users
from public.user_scores s
join public.profiles p on p.id::text = s.user_id
where s.is_public = true;
