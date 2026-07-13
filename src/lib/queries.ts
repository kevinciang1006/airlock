import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/active-org";
import type { OrgRole, Project } from "@/lib/database.types";

export interface UserOrg {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
}

export interface MemberRow {
  userId: string;
  name: string | null;
  email: string | null;
  role: OrgRole;
  joinedAt: string;
}

export interface OverviewCounts {
  projects: number;
  members: number;
}

export async function getSessionUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Orgs the current user belongs to, with their role. RLS-scoped. */
export async function getUserOrgs(): Promise<UserOrg[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Filter to the CURRENT user's memberships. The memberships RLS policy
  // (is_org_member) intentionally exposes every member of your orgs so the
  // Members page works — so without this eq() an org would appear once per
  // co-member (and show a co-member's role). Scope to auth.uid() → one row/org.
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("org_id, role, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error || !memberships || memberships.length === 0) return [];

  const orgIds = memberships.map((m) => m.org_id);
  const { data: orgs } = await supabase.from("organizations").select("id, name, slug").in("id", orgIds);
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));

  const result: UserOrg[] = [];
  for (const m of memberships) {
    const o = orgById.get(m.org_id);
    if (o) result.push({ id: o.id, name: o.name, slug: o.slug, role: m.role });
  }
  return result;
}

/** The active org from the cookie, falling back to the first membership. */
export async function resolveActiveOrg(): Promise<UserOrg | null> {
  const orgs = await getUserOrgs();
  if (orgs.length === 0) return null;
  const activeId = getActiveOrgId();
  return orgs.find((o) => o.id === activeId) ?? orgs[0] ?? null;
}

/** Projects in an org, newest first. RLS-scoped. */
export async function getProjects(orgId: string): Promise<Project[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** A single project by id (RLS returns null if not visible to the user). */
export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

/** Members of an org with names/emails from profiles. RLS-scoped. */
export async function getMembers(orgId: string): Promise<MemberRow[]> {
  const supabase = createClient();
  const { data: memberships } = await supabase
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (!memberships || memberships.length === 0) return [];

  const userIds = memberships.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return memberships.map((m) => {
    const p = profileById.get(m.user_id);
    return {
      userId: m.user_id,
      name: p?.full_name ?? null,
      email: p?.email ?? null,
      role: m.role,
      joinedAt: m.created_at,
    };
  });
}

/** Real counts for the overview KPIs. */
export async function getOverviewCounts(orgId: string): Promise<OverviewCounts> {
  const supabase = createClient();
  const [{ count: projects }, { count: members }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("org_id", orgId),
  ]);
  return { projects: projects ?? 0, members: members ?? 0 };
}
