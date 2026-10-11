create extension if not exists "pgcrypto";

create type airlock_org_role as enum ('owner', 'admin', 'member');

create table airlock_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table airlock_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references airlock_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role airlock_org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table airlock_projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references airlock_organizations(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index on airlock_memberships (user_id);
create index on airlock_memberships (org_id);
create index on airlock_projects (org_id);
