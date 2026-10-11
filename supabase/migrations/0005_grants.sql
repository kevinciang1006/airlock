-- Table privileges for the PostgREST API roles.
--
-- RLS governs WHICH ROWS each role may touch, but Postgres checks table-level
-- privileges first, so the API roles need base DML grants or every query fails
-- with "permission denied for table ...". Hosted Supabase grants these by
-- default; a local stack may not, so we make it explicit and portable.
--
-- Scoped to airlock_* tables only: this project shares a Supabase database
-- with other demos, so we must not touch grants on anyone else's tables, and
-- we must not change default privileges for the whole schema.
--
-- This does NOT weaken the model: airlock_organizations / airlock_memberships
-- still have no INSERT policy, so RLS denies inserts there despite the grant
-- (creation stays RPC-only), and every other table remains filtered by its
-- policies.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.airlock_organizations,
  public.airlock_memberships,
  public.airlock_projects,
  public.airlock_profiles
  to anon, authenticated, service_role;
