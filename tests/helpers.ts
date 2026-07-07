import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrgRole, Organization, Project } from "../src/lib/database.types";

/**
 * Isolation-test harness.
 *
 * Assertions must run through ANON clients carrying a real user session — that
 * is the only way RLS is exercised. The service-role client bypasses RLS and is
 * used ONLY to (a) create confirmed test users via the Admin API, (b) seed a
 * membership (membership creation is intentionally outside RLS — see 0003_rls),
 * and (c) make ground-truth reads that confirm a blocked write really was a
 * no-op. Never use it in an isolation assertion.
 */

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing env var ${name}. Run \`supabase start\` and put its URL + keys in .env (see .env.example).`,
    );
  }
  return v;
}

export type AnonClient = SupabaseClient<Database>;
export interface TestUser {
  id: string;
  email: string;
}

const noPersist = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Fresh anonymous client with no session — the RLS-exercising client. */
export function makeAnonClient(): AnonClient {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, noPersist);
}

/** Service-role client — bypasses RLS. Setup/teardown/ground-truth only. */
export function adminClient(): AnonClient {
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, noPersist);
}

/** Create an email-confirmed user via the Admin API. */
export async function createTestUser(email: string, password: string): Promise<TestUser> {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createTestUser(${email}) failed: ${error?.message}`);
  return { id: data.user.id, email };
}

/** Sign in with email+password on a fresh anon client; returns the authed client. */
export async function signIn(email: string, password: string): Promise<AnonClient> {
  const client = makeAnonClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn(${email}) failed: ${error.message}`);
  return client;
}

/** Call the create_organization RPC as the given authed client. */
export async function createOrgAs(client: AnonClient, name: string, slug: string): Promise<Organization> {
  const { data, error } = await client.rpc("create_organization", { org_name: name, org_slug: slug });
  if (error || !data) throw new Error(`create_organization(${slug}) failed: ${error?.message}`);
  return data as Organization;
}

/** Insert a project as the given authed client (relies on RLS to permit it). */
export async function addProjectAs(
  client: AnonClient,
  orgId: string,
  createdBy: string,
  name: string,
): Promise<Project> {
  const { data, error } = await client
    .from("projects")
    .insert({ org_id: orgId, name, created_by: createdBy })
    .select()
    .single();
  if (error || !data) throw new Error(`addProjectAs(${name}) failed: ${error?.message}`);
  return data;
}

/** Seed a membership with the service role (bypasses RLS — setup only). */
export async function addMembershipAdmin(orgId: string, userId: string, role: OrgRole): Promise<void> {
  const { error } = await adminClient().from("memberships").insert({ org_id: orgId, user_id: userId, role });
  if (error) throw new Error(`addMembershipAdmin failed: ${error.message}`);
}

/** Delete users via the Admin API (teardown). */
export async function deleteUsers(ids: string[]): Promise<void> {
  const admin = adminClient();
  for (const id of ids) {
    await admin.auth.admin.deleteUser(id);
  }
}
