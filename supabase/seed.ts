import "dotenv/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrgRole } from "../src/lib/database.types";

/**
 * Seed script — creates two demo orgs with real logins.
 *
 * Uses the service role for user creation + membership seeding, but creates
 * orgs by SIGNING IN as each owner and calling the airlock_create_organization RPC —
 * so the seed exercises the same RPC + RLS path a real user would. Idempotent:
 * safe to run repeatedly.
 */

const URL = required("NEXT_PUBLIC_SUPABASE_URL");
const ANON = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE = required("SUPABASE_SERVICE_ROLE_KEY");
const PASSWORD = "AirlockDemo123!";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n✗ Missing env var ${name}. Run \`supabase start\` and fill .env (see .env.example).\n`);
    process.exit(1);
  }
  return v;
}

const admin = createClient<Database>(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

async function getOrCreateUser(email: string, fullName: string): Promise<string> {
  const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const existing = list.users.find((u) => u.email === email);
  let id: string;
  if (existing) {
    id = existing.id;
  } else {
    const { data, error: cErr } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (cErr || !data.user) throw new Error(`create user ${email}: ${cErr?.message}`);
    id = data.user.id;
  }

  // Guarantee a profile row. The airlock_handle_new_user trigger normally does this on
  // insert, but a user created BEFORE 0004_profiles was applied (or before the
  // trigger existed) would have no profile — so the members list / project
  // owners would render as "Unknown". This idempotent upsert closes that gap.
  const { error: pErr } = await admin
    .from("airlock_profiles")
    .upsert({ id, email, full_name: fullName }, { onConflict: "id" });
  if (pErr) throw new Error(`upsert profile ${email}: ${pErr.message}`);

  return id;
}

async function signedInClient(email: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign in ${email}: ${error.message}`);
  return client;
}

async function ensureOrg(ownerEmail: string, name: string, slug: string): Promise<string> {
  const { data: existing } = await admin.from("airlock_organizations").select("id").eq("slug", slug).maybeSingle();
  if (existing) return existing.id;
  const client = await signedInClient(ownerEmail);
  const { data, error } = await client.rpc("airlock_create_organization", { org_name: name, org_slug: slug });
  if (error || !data) throw new Error(`airlock_create_organization ${slug}: ${error?.message}`);
  return data.id;
}

async function ensureProjects(
  ownerEmail: string,
  ownerId: string,
  orgId: string,
  projects: { name: string; description: string }[],
): Promise<void> {
  const client = await signedInClient(ownerEmail);
  for (const p of projects) {
    const { data: existing } = await admin
      .from("airlock_projects")
      .select("id")
      .eq("org_id", orgId)
      .eq("name", p.name)
      .maybeSingle();
    if (existing) continue;
    const { error } = await client
      .from("airlock_projects")
      .insert({ org_id: orgId, name: p.name, description: p.description, created_by: ownerId });
    if (error) throw new Error(`insert project ${p.name}: ${error.message}`);
  }
}

async function ensureMembership(orgId: string, userId: string, role: OrgRole): Promise<void> {
  const { data: existing } = await admin
    .from("airlock_memberships")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return;
  const { error } = await admin.from("airlock_memberships").insert({ org_id: orgId, user_id: userId, role });
  if (error) throw new Error(`insert membership: ${error.message}`);
}

async function main() {
  console.log("Seeding Airlock demo data…");

  const acmeOwnerId = await getOrCreateUser("demo@airlock.dev", "Ada Lovelace");
  const globexOwnerId = await getOrCreateUser("globex@airlock.dev", "Grace Hopper");
  const memberId = await getOrCreateUser("member@airlock.dev", "Marvin Minsky");

  const acmeOrgId = await ensureOrg("demo@airlock.dev", "Acme Inc", "acme");
  const globexOrgId = await ensureOrg("globex@airlock.dev", "Globex Corp", "globex");

  await ensureProjects("demo@airlock.dev", acmeOwnerId, acmeOrgId, [
    { name: "Payments API", description: "Core billing + payment orchestration service." },
    { name: "Web Dashboard", description: "Customer-facing analytics dashboard." },
    { name: "Data Pipeline", description: "ETL jobs feeding the warehouse." },
  ]);

  await ensureProjects("globex@airlock.dev", globexOwnerId, globexOrgId, [
    { name: "Growth Site", description: "Marketing site + lead capture." },
    { name: "Mobile App", description: "iOS / Android client." },
    { name: "Analytics Service", description: "Event ingestion + reporting." },
  ]);

  await ensureMembership(acmeOrgId, memberId, "member");

  console.log(`
✓ Seed complete.

  Demo logins (password for all: ${PASSWORD})
  ------------------------------------------------
  demo@airlock.dev     owner of Acme Inc   (acme)
  globex@airlock.dev   owner of Globex Corp (globex)
  member@airlock.dev    member of Acme Inc  (acme)

  Log in as Acme, then Globex — neither sees the other's projects.
`);
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
