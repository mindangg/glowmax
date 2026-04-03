-- user_scores: one row per user, stores highest score
create table if not exists public.user_scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  username      text not null,
  overall_score numeric(4,2) not null check (overall_score >= 0 and overall_score <= 10),
  is_public     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  constraint user_scores_user_id_key unique (user_id)
);

alter table public.user_scores enable row level security;

create policy "Public scores are readable"
  on public.user_scores for select
  using (is_public = true);

create policy "Users can insert own score"
  on public.user_scores for insert
  with check (user_id = auth.uid()::text);

create policy "Users can update own score"
  on public.user_scores for update
  using (user_id = auth.uid()::text);

-- Leaderboard view with rank
create or replace view public.leaderboard as
select
  username,
  overall_score,
  rank() over (order by overall_score desc)::int as rank,
  count(*) over ()::int as total_users
from public.user_scores
where is_public = true;

-- Helper function for upsert keeping highest score
create or replace function public.upsert_user_score(
  p_user_id text,
  p_username text,
  p_score numeric,
  p_is_public boolean
) returns void language plpgsql security definer as $$
begin
  insert into public.user_scores (user_id, username, overall_score, is_public)
  values (p_user_id, p_username, p_score, p_is_public)
  on conflict (user_id) do update
    set
      username      = excluded.username,
      overall_score = greatest(excluded.overall_score, user_scores.overall_score),
      is_public     = excluded.is_public,
      updated_at    = now();
end;
$$;
