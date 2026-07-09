-- Table privileges for the PostgREST API roles.
--
-- RLS governs WHICH ROWS each role may touch, but Postgres checks table-level
-- privileges first — so the API roles need base DML grants or every query fails
-- with "permission denied for table ...". Hosted Supabase grants these by
-- default; a local stack may not, so we make it explicit and portable.
--
-- This does NOT weaken the model: organizations/memberships still have no
-- INSERT policy, so RLS denies inserts there despite the grant (creation stays
-- RPC-only), and every other table remains filtered by its policies.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

-- Cover tables added by any later migration in this schema.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
