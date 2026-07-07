create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from memberships
    where org_id = target_org and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(target_org uuid, roles org_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from memberships
    where org_id = target_org
      and user_id = auth.uid()
      and role = any(roles)
  );
$$;

create or replace function public.create_organization(org_name text, org_slug text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into organizations (name, slug)
    values (org_name, org_slug)
    returning * into new_org;
  insert into memberships (org_id, user_id, role)
    values (new_org.id, auth.uid(), 'owner');
  return new_org;
end;
$$;
