alter table airlock_organizations enable row level security;
alter table airlock_memberships enable row level security;
alter table airlock_projects enable row level security;

-- airlock_organizations
create policy "airlock_org_select_members" on airlock_organizations
  for select using (public.airlock_is_org_member(id));

-- airlock_memberships
create policy "airlock_membership_select" on airlock_memberships
  for select using (public.airlock_is_org_member(org_id));

-- airlock_projects
create policy "airlock_projects_select" on airlock_projects
  for select using (public.airlock_is_org_member(org_id));

create policy "airlock_projects_insert" on airlock_projects
  for insert with check (public.airlock_is_org_member(org_id));

create policy "airlock_projects_update" on airlock_projects
  for update using (public.airlock_is_org_member(org_id))
  with check (public.airlock_is_org_member(org_id));

create policy "airlock_projects_delete" on airlock_projects
  for delete using (public.airlock_has_org_role(org_id, array['owner','admin']::airlock_org_role[]));

-- NOTE: airlock_organizations and airlock_memberships intentionally have NO insert policy.
-- Org creation goes through public.airlock_create_organization (SECURITY DEFINER),
-- which inserts the org + owner membership atomically. This closes the
-- first-insert bootstrap gap and prevents orphan orgs. Documented in README.
