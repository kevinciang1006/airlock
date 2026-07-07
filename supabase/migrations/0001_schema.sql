create extension if not exists "pgcrypto";

create type org_role as enum ('owner', 'admin', 'member');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index on memberships (user_id);
create index on memberships (org_id);
create index on projects (org_id);
