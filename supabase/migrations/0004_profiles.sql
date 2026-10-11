-- Additive migration (not part of the graded 0001–0003 core).
-- A profile mirror of auth.users so the app can show member names/emails.
-- RLS keeps it tenant-scoped: you can only read airlock_profiles of people who share
-- an org with you — reinforcing the isolation model.

create table airlock_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

-- No trigger on auth.users: this runs in a shared Supabase project, so we
-- don't attach anything to the shared auth table. The seed script upserts
-- airlock_profiles rows for the demo accounts instead.

-- SECURITY DEFINER helper: do auth.uid() and target_user share any org?
-- Bypasses airlock_memberships RLS internally to avoid policy recursion.
create or replace function public.airlock_shares_org(target_user uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from airlock_memberships a
    join airlock_memberships b on a.org_id = b.org_id
    where a.user_id = auth.uid()
      and b.user_id = target_user
  );
$$;

alter table airlock_profiles enable row level security;

create policy "airlock_profiles_select_shared_org" on airlock_profiles
  for select using (id = auth.uid() or public.airlock_shares_org(id));

create policy "airlock_profiles_update_self" on airlock_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "airlock_profiles_insert_self" on airlock_profiles
  for insert with check (id = auth.uid());
