import { beforeAll, afterAll, describe, it, expect } from "vitest";
import type { Organization, Project } from "../src/lib/database.types";
import {
  adminClient,
  addMembershipAdmin,
  addProjectAs,
  createOrgAs,
  createTestUser,
  deleteUsers,
  signIn,
  type AnonClient,
  type TestUser,
} from "./helpers";

/**
 * Tenant-isolation suite — the security contract.
 *
 * Two users in two orgs (Acme, Globex) + a `member` in Acme. Every assertion
 * runs through an anon client with a real session, so RLS is what's being
 * tested. If any of these regress, cross-tenant data has leaked.
 */

const PASSWORD = "Password123!";
const TS = Date.now();

let userA: TestUser; // owner of Acme
let userB: TestUser; // owner of Globex
let memberM: TestUser; // member of Acme

let clientA: AnonClient;
let clientB: AnonClient;
let clientM: AnonClient;

let acmeOrg: Organization;
let globexOrg: Organization;
let acmeProject: Project;
let globexProject: Project;

beforeAll(async () => {
  userA = await createTestUser(`a+${TS}@acme.test`, PASSWORD);
  userB = await createTestUser(`b+${TS}@globex.test`, PASSWORD);
  memberM = await createTestUser(`m+${TS}@acme.test`, PASSWORD);

  // User A creates Acme (owner) + a project — exercises the real RPC + RLS path.
  clientA = await signIn(userA.email, PASSWORD);
  acmeOrg = await createOrgAs(clientA, "Acme Inc", `acme-${TS}`);
  acmeProject = await addProjectAs(clientA, acmeOrg.id, userA.id, "Acme Alpha");

  // User B creates Globex (owner) + a project.
  clientB = await signIn(userB.email, PASSWORD);
  globexOrg = await createOrgAs(clientB, "Globex Corp", `globex-${TS}`);
  globexProject = await addProjectAs(clientB, globexOrg.id, userB.id, "Globex Beta");

  // Seed a member in Acme (membership creation is outside RLS by design).
  await addMembershipAdmin(acmeOrg.id, memberM.id, "member");
  clientM = await signIn(memberM.email, PASSWORD);
});

afterAll(async () => {
  // Delete orgs first (cascades projects + memberships), then users.
  await adminClient().from("organizations").delete().in("id", [acmeOrg?.id, globexOrg?.id].filter(Boolean));
  await deleteUsers([userA?.id, userB?.id, memberM?.id].filter(Boolean) as string[]);
});

describe("tenant isolation", () => {
  it("1. A's projects select returns only Acme rows", async () => {
    const { data, error } = await clientA.from("projects").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    for (const p of data ?? []) expect(p.org_id).toBe(acmeOrg.id);
    const ids = (data ?? []).map((p) => p.id);
    expect(ids).toContain(acmeProject.id);
    expect(ids).not.toContain(globexProject.id);
  });

  it("2. A cannot select Globex's organization (empty, not error)", async () => {
    const { data, error } = await clientA.from("organizations").select("*").eq("id", globexOrg.id);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("3. A cannot select Globex's memberships (empty)", async () => {
    const { data, error } = await clientA.from("memberships").select("*").eq("org_id", globexOrg.id);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("4. A insert into projects with org_id = Globex is rejected (WITH CHECK)", async () => {
    const { error } = await clientA
      .from("projects")
      .insert({ org_id: globexOrg.id, name: "intrusion", created_by: userA.id });
    expect(error).not.toBeNull();
  });

  it("5. A update of a Globex project affects 0 rows", async () => {
    const { data, error } = await clientA
      .from("projects")
      .update({ name: "hacked" })
      .eq("id", globexProject.id)
      .select();
    expect(error).toBeNull();
    expect(data).toEqual([]);
    // ground truth: the name is unchanged
    const { data: truth } = await adminClient()
      .from("projects")
      .select("name")
      .eq("id", globexProject.id)
      .maybeSingle();
    expect(truth?.name).toBe("Globex Beta");
  });

  it("6. A delete of a Globex project affects 0 rows and it still exists", async () => {
    const { data, error } = await clientA.from("projects").delete().eq("id", globexProject.id).select();
    expect(error).toBeNull();
    expect(data).toEqual([]);
    const { data: truth } = await adminClient()
      .from("projects")
      .select("id")
      .eq("id", globexProject.id)
      .maybeSingle();
    expect(truth?.id).toBe(globexProject.id);
  });

  it("7. Positive control: A can fully CRUD within Acme", async () => {
    // create
    const { data: created, error: cErr } = await clientA
      .from("projects")
      .insert({ org_id: acmeOrg.id, name: "Acme Temp", created_by: userA.id })
      .select()
      .single();
    expect(cErr).toBeNull();
    expect(created).not.toBeNull();
    const id = created!.id;

    // read (visible in A's scoped list)
    const { data: list } = await clientA.from("projects").select("id").eq("id", id);
    expect((list ?? []).map((p) => p.id)).toContain(id);

    // update
    const { data: upd } = await clientA.from("projects").update({ name: "Acme Temp 2" }).eq("id", id).select();
    expect(upd?.length).toBe(1);

    // delete (A is owner)
    const { data: del } = await clientA.from("projects").delete().eq("id", id).select();
    expect(del?.length).toBe(1);
  });

  it("8. Role control: a member cannot DELETE; an owner can", async () => {
    // member M attempts to delete an Acme project → blocked by has_org_role
    const { data: mDel, error: mErr } = await clientM
      .from("projects")
      .delete()
      .eq("id", acmeProject.id)
      .select();
    expect(mErr).toBeNull();
    expect(mDel).toEqual([]);
    const { data: stillThere } = await adminClient()
      .from("projects")
      .select("id")
      .eq("id", acmeProject.id)
      .maybeSingle();
    expect(stillThere?.id).toBe(acmeProject.id);

    // owner A can delete a throwaway Acme project
    const throwaway = await addProjectAs(clientA, acmeOrg.id, userA.id, "Acme Disposable");
    const { data: aDel } = await clientA.from("projects").delete().eq("id", throwaway.id).select();
    expect(aDel?.length).toBe(1);
  });
});
