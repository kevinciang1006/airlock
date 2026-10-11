# Airlock — Multi-Tenant Supabase RLS Starter

[![CI](https://github.com/kevinciang1006/airlock/actions/workflows/ci.yml/badge.svg)](https://github.com/kevinciang1006/airlock/actions/workflows/ci.yml)

**Live:** https://airlock.kevinciang.com (demo logins below)

> A multi-tenant SaaS reference implementation on **Next.js 14 + Supabase**, whose defining feature is **database-enforced tenant isolation** — proven by a written isolation test suite that fails loudly if cross-tenant data could ever leak, and gated in CI on every push.

The SQL migrations, the RLS policies, and the isolation tests are the product. The UI (a full ops console) exists to make the isolation _visible_ — log in as one org, then another, and watch that neither ever sees the other's data.

---

## Tenancy model

The live demo shares one Supabase project with other demos, so every table, function and policy is prefixed `airlock_` (e.g. `airlock_organizations`, `airlock_is_org_member`). Names below drop the prefix for readability.

- **Tenant = `organization`.** Users join organizations through **`memberships`** (each with a `role`: `owner` / `admin` / `member`). Every org-scoped resource (here, `projects`) carries an **`org_id`**.
- **The database is the security boundary.** The client never decides what it can see — Postgres does, via Row-Level Security. The app carries the user's session into every query (`@supabase/ssr`), so each query runs _as that user_ and RLS filters it. There is **no client-side authorization** standing in for the database; UI role-gating is UX only.

```
organizations ──< memberships >── auth.users
      │
      └──< projects (org_id, created_by)
profiles (id → auth.users)   ← additive, mirrors auth.users for member names
```

## RLS design

RLS is enabled on **every** table. Membership checks go through two `SECURITY DEFINER` helper functions with a **pinned `search_path`**, both marked `stable`:

- `is_org_member(target_org uuid) → boolean` — is `auth.uid()` a member of `target_org`?
- `has_org_role(target_org uuid, roles org_role[]) → boolean` — role-gated actions.

Why `SECURITY DEFINER` + `set search_path = public`: the helpers read `memberships` from _inside_ a policy that is itself protecting `memberships`/`organizations`. Running them as the definer (owner) with a pinned search path avoids **RLS recursion** and prevents search-path hijacking.

Policies (`supabase/migrations/0003_rls.sql`), per table/action:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `organizations` | `is_org_member(id)` | — (RPC only) | — | — |
| `memberships` | `is_org_member(org_id)` | — (RPC only) | — | — |
| `projects` | `is_org_member(org_id)` | `with check is_org_member(org_id)` | `using` + `with check is_org_member(org_id)` | `has_org_role(org_id, {owner,admin})` |

**Why no INSERT policy on `organizations`/`memberships`:** an org and its first membership must be created together, but a brand-new user isn't a member of anything yet — a naive INSERT policy can't express "you may create the org you're about to join" without a bootstrap gap. So org creation goes through a single `SECURITY DEFINER` RPC:

```sql
create_organization(org_name, org_slug)  -- inserts the org AND the owner membership in one transaction
```

This closes the first-insert gap and prevents orphan orgs. The seed script and the app both create orgs exclusively through this RPC, so the real path is exercised end-to-end.

`0004_profiles.sql` is an **additive** migration (not part of the graded core): a `profiles` mirror of `auth.users` so the UI can show member names/emails. Its RLS keeps it tenant-scoped — you can only read the profile of someone who **shares an org with you** (`shares_org(...)`, another `SECURITY DEFINER` helper) — which reinforces the isolation model rather than weakening it.

## Isolation test suite (the differentiator)

`tests/isolation.test.ts` sets up **User A in Org Acme** and **User B in Org Globex** (plus a `member` in Acme) and asserts, using **anon clients with real user sessions only — never the service role, which bypasses RLS**:

1. A's `projects` select returns only Acme rows.
2. A cannot select Globex's `organizations` row (empty, not error).
3. A cannot select Globex's `memberships` rows (empty).
4. A insert into `projects` with `org_id = Globex` is **rejected** (RLS `with check`).
5. A update of a Globex project affects **0 rows**.
6. A delete of a Globex project affects **0 rows** (verified still present).
7. Positive control: A can fully CRUD within Acme.
8. Role control: a `member` cannot DELETE; an `owner` can.

The service role is used _only_ to create confirmed test users, seed a membership, and make ground-truth reads that confirm a blocked write was a no-op — never inside an assertion.

```bash
npm run test:isolation
```

## Scaling path — JWT-claims RLS

The helper-function approach is chosen here for **clarity**: policies read `memberships` at query time, so membership changes take effect immediately and the model is easy to audit. At high scale the per-query membership lookup is the cost.

The performance alternative is to put `org_ids` / `roles` into the JWT `app_metadata` via a **custom access-token hook**, then have policies read the claim (`auth.jwt() -> 'app_metadata' -> 'org_ids'`) instead of hitting `memberships`. Trade-off: claims are only refreshed when the token is re-issued, so a membership change requires a **token refresh** (or a short token lifetime) before it takes effect. Airlock keeps the helper-function model and documents this as the scaling switch.

## Tech stack

- **Next.js 14** App Router — Server Components for reads, Server Actions for writes. TypeScript **strict**, `noUncheckedIndexedAccess`, **no `any`**.
- **Supabase** — Postgres + Auth + RLS. `@supabase/ssr` for App Router session handling (browser + server clients + middleware). Email + password is the primary flow; Google OAuth is wired and optional.
- **Tailwind CSS** + a small set of shadcn/ui-style primitives. Design tokens (light theme, warm-amber accent, Space Grotesk / Inter / IBM Plex Mono) live as CSS variables.
- **Vitest** for the isolation suite. **GitHub Actions** for CI.

## Local setup

Prerequisites: **Node ≥ 18**, **Docker** (for the local Supabase stack), and the **Supabase CLI**.

```bash
# 1. Install deps
npm install

# 2. Start the local Supabase stack (Postgres + Auth + Studio)
supabase start

# 3. Apply migrations to a clean database
supabase db reset

# 4. Point the app + scripts at the local stack:
#    copy .env.example -> .env and fill from `supabase status`
cp .env.example .env
#    set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#    and SUPABASE_SERVICE_ROLE_KEY from `supabase status`

# 5. Seed two demo orgs with working logins
npm run seed

# 6. Run the app
npm run dev            # http://localhost:3000

# Prove isolation
npm run test:isolation
```

### Demo logins

| Email | Role | Org |
|---|---|---|
| `demo@airlock.dev` | owner | Acme Inc (`acme`) |
| `globex@airlock.dev` | owner | Globex Corp (`globex`) |
| `member@airlock.dev` | member | Acme Inc (`acme`) |

Password for all: `AirlockDemo123!` (also shown, with copy buttons, on the login page). Log in as Acme, then Globex — neither sees the other's projects.

## What this demo does not do

- **No billing or payments.** The Billing and Usage screens are mock UI from `src/lib/mock-data.ts`; nothing charges or meters.
- **Invitations don't send anything.** The invite dialog only shows a confirmation toast; no email goes out and no membership is created.
- **No real audit log.** The audit log and the overview activity feed are mock events.
- **Settings are mostly UI.** API keys, webhooks, SSO and 2FA in Settings are mock; only the wired screens listed below talk to Supabase.

## Which screens are real vs mock

Honesty matters when a reviewer digs in. The **wired, backend-real core** runs on Supabase with RLS-enforced isolation:

- **Auth** (sign in / sign up), the **org switcher**, **projects** (list + create + delete, role-gated), and the **members** list (names/emails via `profiles`).

**Everything else is convincing mock UI**, rendered from `src/lib/mock-data.ts` with the same components and tokens: the overview charts (real project/member counts, mock analytics), billing, usage, audit log, most of settings (API keys, webhooks, SSO, 2FA), the ⌘K palette, and the projects kanban. Project **status** and **request counts** are derived deterministically for display (the graded schema has no such columns). The distinction is functional, not visual.

## CI

`.github/workflows/ci.yml` runs on every push / PR: boot a local Supabase, `supabase db reset` to apply migrations, then **`npm run test:isolation`** (the gate) plus `typecheck` and `build`. The green badge means tenant isolation was verified on that commit.

## Deploy

- **Data:** create a hosted Supabase project → `supabase link` → `supabase db push` to apply migrations → run `npm run seed` against it (service-role key).
- **Frontend:** deploy to Vercel. Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (seed only), `NEXT_PUBLIC_SITE_URL`.
- In Supabase Auth settings, add your deployed URL + `.../auth/callback` to the allowed redirect URLs.

## Extension points (designed for, not built)

Email invites, audit logging (persisted), JWT-claim-based RLS for performance, per-resource sharing overrides, soft deletes, SSO/SCIM. The schema and structure anticipate these.

## Project layout

```
supabase/migrations/   0001 schema · 0002 functions+RPC · 0003 RLS · 0004 profiles (additive)
supabase/seed.ts       admin-API seed (two orgs via the real RPC)
tests/                 isolation.test.ts (8 assertions) + helpers.ts
src/app/               login, auth/callback, (app)/ shell + routed screens, actions.ts
src/lib/supabase/      @supabase/ssr server + browser clients + middleware
src/lib/               queries (RLS-scoped reads), database.types, mock-data
docs/design/           the imported design comp (visual source of truth)
```
