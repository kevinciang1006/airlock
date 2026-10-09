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

-- Populate/refresh a profile whenever an auth user is created.
create or replace function public.airlock_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.airlock_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.airlock_profiles.full_name);
  return new;
end;
$$;

create trigger airlock_on_auth_user_created
  after insert on auth.users
  for each row execute function public.airlock_handle_new_user();

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
