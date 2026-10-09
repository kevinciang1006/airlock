"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setActiveOrgId, setSidebarCollapsed } from "@/lib/active-org";
import { getUserOrgs, resolveActiveOrg } from "@/lib/queries";

/* ============================ Auth ============================ */

export type AuthState = { error?: string; message?: string } | undefined;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Single dispatcher for sign in / sign up / forgot-password (useFormState). */
export async function authAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "signin");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = createClient();

  if (mode === "signup") {
    const fullName = String(formData.get("name") ?? "").trim();
    if (!email || !password) return { error: "Email and password are required." };
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${siteUrl()}/auth/callback` },
    });
    if (error) return { error: error.message };
    redirect("/");
  }

  if (mode === "forgot") {
    if (!email) return { error: "Enter your email address." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/auth/callback`,
    });
    if (error) return { error: error.message };
    return { message: "If that email exists, a reset link is on its way." };
  }

  // sign in
  if (!email || !password) return { error: "Email and password are required." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/");
}

/** Optional Google OAuth — documented, not required for the demo. */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });
  if (!error && data.url) redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/* ============================ Org ============================ */

/** Set the active org (cookie) and refresh the app. */
export async function switchOrg(orgId: string): Promise<void> {
  setActiveOrgId(orgId);
  revalidatePath("/", "layout");
}

/** Create an org via the RPC (org + owner membership atomic), then switch to it. */
export async function createOrg(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!name || !slug) return { error: "Organization name and slug are required." };

  const supabase = createClient();
  const { data, error } = await supabase.rpc("airlock_create_organization", { org_name: name, org_slug: slug });
  if (error || !data) return { error: error?.message ?? "Could not create organization." };
  setActiveOrgId(data.id);
  revalidatePath("/", "layout");
  redirect("/");
}

/* ============================ Sidebar ============================ */

export async function toggleSidebar(collapsed: boolean): Promise<void> {
  setSidebarCollapsed(collapsed);
}

/* ============================ Projects ============================ */

export async function createProject(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Project name is required." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return { error: "No active organization." };

  // RLS `with check (is_org_member(org_id))` is the real guard — we never trust
  // a client-supplied org_id.
  const { error } = await supabase.from("airlock_projects").insert({
    org_id: activeOrg.id,
    name,
    description: description || null,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath("/");
  return { message: "Created" };
}

export async function deleteProject(projectId: string): Promise<AuthState> {
  const supabase = createClient();
  // RLS `has_org_role(org_id, {owner,admin})` enforces the permission.
  const { error } = await supabase.from("airlock_projects").delete().eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  revalidatePath("/");
  return { message: "Deleted" };
}

export async function updateProject(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || !name) return { error: "Project name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("airlock_projects")
    .update({ name, description: description || null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  return { message: "Saved" };
}

/** Guard used by the create-org onboarding: does the user belong to any org? */
export async function hasAnyOrg(): Promise<boolean> {
  const orgs = await getUserOrgs();
  return orgs.length > 0;
}
