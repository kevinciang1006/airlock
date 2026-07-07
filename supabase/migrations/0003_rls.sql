alter table organizations enable row level security;
alter table memberships enable row level security;
alter table projects enable row level security;

-- organizations
create policy "org_select_members" on organizations
  for select using (public.is_org_member(id));

-- memberships
create policy "membership_select" on memberships
  for select using (public.is_org_member(org_id));

-- projects
create policy "projects_select" on projects
  for select using (public.is_org_member(org_id));

create policy "projects_insert" on projects
  for insert with check (public.is_org_member(org_id));

create policy "projects_update" on projects
  for update using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create policy "projects_delete" on projects
  for delete using (public.has_org_role(org_id, array['owner','admin']::org_role[]));

-- NOTE: organizations and memberships intentionally have NO insert policy.
-- Org creation goes through public.create_organization (SECURITY DEFINER),
-- which inserts the org + owner membership atomically. This closes the
-- first-insert bootstrap gap and prevents orphan orgs. Documented in README.
