# Airlock — Full Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Airlock — a Next.js 14 + Supabase multi-tenant SaaS console whose functional core (auth, org switcher, projects CRUD, members) is enforced by database Row-Level Security and proven by a Vitest isolation suite gated in CI, wrapped in a full, design-faithful console UI (Overview, Projects, Members real; Billing, Usage, Audit, Settings, ⌘K palette convincing mock).

**Architecture:** The database is the security boundary — Postgres RLS scopes every row to the org the caller belongs to; the client never decides what it can see. Reads happen in Server Components, writes in Server Actions, both through `@supabase/ssr` clients that carry the user's session. The active org is tracked in a cookie. Mock screens render from a typed local fixtures module but use the exact same components and design tokens as the real screens, so the distinction is functional, not visual.

**Tech Stack:** Next.js 14 (App Router, RSC, Server Actions), TypeScript strict, Tailwind CSS, a minimal set of shadcn/ui primitives (button, input, card, dropdown-menu, dialog), Supabase (Postgres + Auth + RLS) via `@supabase/ssr` and `@supabase/supabase-js`, Vitest, GitHub Actions, Supabase CLI (local stack).

**Visual source of truth:** The imported design comp is saved at `docs/design/Airlock.dc.html` (Task 0). It is a template (`{{ }}` bindings, `<sc-if>`/`<sc-for>` control tags, inline styles) — read it as the exact spec for markup, spacing, and states, and translate its inline styles into the token classes defined in Task 2. Every screen section is delimited by an HTML comment marker (`<!-- ===== OVERVIEW ===== -->`, etc.).

---

## Global Constraints

- **TypeScript strict, `noUncheckedIndexedAccess`, no `any`.** Supabase responses typed via a `Database` type in `src/lib/database.types.ts`.
- **The database is the security boundary.** No client-side authorization ever stands in for RLS. UI role-gating is UX only.
- **Server Components for reads, Server Actions for writes.** No unnecessary `"use client"`; add it only for interactive leaf components.
- **`@supabase/ssr` only.** Never the deprecated `@supabase/auth-helpers`.
- **Never use the service-role key in the app or in test assertions.** Service role appears only in the seed script and the admin-only step of test setup (creating users) — never in an RLS assertion.
- **Design tokens (from the comp — light theme only, no dark mode, accent is warm amber, no purple anywhere):**
  - `--paper` `#FAFBFC` (app bg) · `--surface` `#FFFFFF` (cards) · `--ink` `#10192A` (primary text) · `--panel` `#10192A` (dark auth panel/avatars)
  - `--muted` `#667085` · `--label` `#344054` · `--faint` `#98A2B3` · `--mid` `#475467`
  - `--line` `#E4E7EC` · grays `#F9FAFB` `#F2F4F7` `#F6F7F9` `#EEF0F3` `#EDEFF2` · `--line-strong` `#D0D5DD` `#C4CAD3`
  - `--accent` `#B25E09` · `--accent-hover` `#8F4B06` · `--accent-bright` `#E9A23B` · accent tint bg `#FBF4EC`/`#FBF0E4` · accent tint border `#F0DFC9` · accent-on-tint text `#7A5320`
  - `--ok` `#067647` + tint `#E7F4EC` · `--warn` `#B54708` · `--danger` `#B42318` + border `#FDA29B` + tint `#FEF3F2`/`#FCEEEA`
  - `--info` `#1257A0` + tint `#EAF1FB` (secondary chart/badge series)
- **Fonts:** Space Grotesk (400/500/600/700) for headings, big numbers, logo, initials; Inter (400/450/500/600/700) for body/UI; IBM Plex Mono (400/500/600) for slugs, IDs, timestamps, API keys, ⌘K badge. Identifiers-in-mono is a required, consistent motif.
- **Radii:** cards 12px, buttons/inputs 9px, small controls 7–8px, pills 999px. **Borders:** 1px `--line`. **Shadows:** dropdown `0 12px 32px rgba(16,25,42,.12)`, drawer `0 12px 40px rgba(16,25,42,.18)`. **Header** 60px, **breadcrumb bar** 40px, **sidebar** 248px expanded / 72px collapsed.
- **Motion:** keyframes `reveal` (.42s cubic-bezier(.16,1,.3,1)), `pop` (.16s), `fadein`, `slideright`, `toastin`, `shimmer` (skeletons). One restrained page-load reveal per route. **`prefers-reduced-motion: reduce` must zero out animations.** Visible focus ring: `2px solid #B25E09; outline-offset:2px`.
- **Copy:** user-side, active voice; button label matches its success toast ("Publish" → "Published"). Realistic mock data (Acme Inc / Globex Corp, plausible names, real-looking slugs/IDs in mono).
- **Idempotent, ordered SQL migrations.** Commit after every green step.
- **Seeded demo logins:** `owner@acme.test` / `owner@globex.test`, password `Password123!`, plus a `member@acme.test` for the role-control test.

---

## File Structure

```
airlock/
  .github/workflows/ci.yml            # CI: local supabase + isolation suite
  docs/design/Airlock.dc.html         # imported comp (visual source of truth)
  docs/superpowers/plans/…            # this plan
  supabase/
    config.toml                       # local stack config
    migrations/
      0001_schema.sql                 # tables + enum + indexes (verbatim from prompt)
      0002_functions.sql              # is_org_member, has_org_role, create_organization
      0003_rls.sql                    # enable RLS + policies (verbatim from prompt)
    seed.ts                           # admin-API seed (service role)
  src/
    app/
      layout.tsx                      # root: fonts, globals, <Toaster>
      globals.css                     # design tokens + base + keyframes
      login/page.tsx                  # auth (sign in / sign up / forgot / onboarding states)
      auth/callback/route.ts          # OAuth / magic-link code exchange
      actions.ts                      # server actions (createProject, deleteProject, createOrg, switchOrg, inviteMember placeholder)
      (app)/
        layout.tsx                    # auth-guarded shell: sidebar + topbar + breadcrumbs
        page.tsx                      # Overview (real project/member counts + mock KPIs/charts)
        projects/page.tsx             # Projects: table + board (real projects)
        projects/[id]/page.tsx        # Project detail: tabs (real metadata + mock activity/access)
        members/page.tsx              # Members (real memberships) + permissions matrix (mock)
        billing/page.tsx              # mock
        usage/page.tsx                # mock
        audit/page.tsx                # mock (isolation-themed)
        settings/page.tsx             # mock (org/profile/security/api-keys/webhooks/notifications/SSO)
    components/
      ui/                             # shadcn: button, input, card, dropdown-menu, dialog
      app-shell/
        sidebar.tsx                   # org switcher + nav + acting-in marker + collapse
        org-switcher.tsx              # dropdown of user's orgs → switchOrg
        topbar.tsx                    # search/⌘K trigger, bell, help, avatar menu
        breadcrumbs.tsx
        command-palette.tsx           # ⌘K (mock fuzzy nav)
        mobile-nav.tsx                # drawer + backdrop wiring
      projects/
        project-table.tsx            # sortable/selectable/paginated table + bulk bar
        project-board.tsx            # kanban columns
        view-toggle.tsx              # Table | Board
        project-filters.tsx          # search + status filters
        create-project-dialog.tsx    # modal + validation → createProject
        delete-project-dialog.tsx    # confirm → deleteProject (role-gated)
      members/
        members-table.tsx
        invite-member-dialog.tsx     # mock
        permissions-matrix.tsx       # mock
      overview/
        kpi-card.tsx                 # stat + sparkline
        sparkline.tsx                # svg path helper
        area-chart.tsx               # svg area/line
        breakdown-bars.tsx
        activity-feed.tsx
      primitives/
        status-badge.tsx             # project status pill
        role-badge.tsx               # owner/admin/member pill
        avatar.tsx                   # initials block (deterministic color)
        mono.tsx                     # <span> in IBM Plex Mono for identifiers
      toast/
        toaster.tsx                  # toast context + viewport (client)
        use-toast.ts
    lib/
      supabase/
        server.ts                    # @supabase/ssr server client (cookies())
        client.ts                    # @supabase/ssr browser client
        middleware.ts                # session refresh helper
      database.types.ts              # generated/typed DB types
      queries.ts                     # typed server-side reads (orgs, projects, members)
      active-org.ts                  # read/write active-org cookie
      mock-data.ts                   # typed fixtures for mock screens
      format.ts                      # date/number/initials/color helpers
    middleware.ts                    # next middleware → session refresh + route guard
  .env.example
  .gitignore
  README.md
  package.json
  next.config.mjs
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
  components.json                    # shadcn config
  vitest.config.ts
  tests/
    isolation.test.ts                # the 8 assertions
    helpers.ts                       # createTestUser, signIn, makeAnonClient
```

---

# Phase A — Repo, config, design system

### Task 0: Initialize repo + save the comp

**Files:**
- Create: `airlock/.gitignore`, `airlock/docs/design/Airlock.dc.html`

- [ ] **Step 1:** `git init` in `airlock/`. Create `.gitignore` with: `node_modules`, `.next`, `.env`, `.env.local`, `supabase/.temp`, `coverage`, `.DS_Store`.
- [ ] **Step 2:** Copy the already-downloaded comp from the scratchpad into `docs/design/Airlock.dc.html` (source: `/private/tmp/claude-501/-Users-kevinciang-Documents-Projects/81850fec-3392-4263-9046-ccc1233edb6f/scratchpad/Airlock.dc.html`).
- [ ] **Step 3:** Move this plan into `docs/superpowers/plans/` if not already there.
- [ ] **Step 4:** Commit: `chore: init repo + import design comp`.

### Task 1: Project scaffold + toolchain

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `.env.example`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `seed`, `test:isolation`; Node ≥ 18.

- [ ] **Step 1:** `package.json` with deps: `next@^14.2`, `react@^18`, `react-dom@^18`, `@supabase/ssr@^0.5`, `@supabase/supabase-js@^2`. devDeps: `typescript@^5`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss@^3.4`, `postcss`, `autoprefixer`, `vitest@^2`, `dotenv`, `tsx`, `eslint`, `eslint-config-next`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-dialog`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`. Scripts:
  ```json
  {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "seed": "tsx supabase/seed.ts",
    "test:isolation": "vitest run tests/isolation.test.ts"
  }
  ```
- [ ] **Step 2:** `tsconfig.json` — `strict: true`, `noUncheckedIndexedAccess: true`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`, Next plugin, `jsx: preserve`.
- [ ] **Step 3:** `next.config.mjs` (minimal, `reactStrictMode: true`), `postcss.config.mjs` (tailwind + autoprefixer), `.env.example` documenting `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (seed/tests only), `NEXT_PUBLIC_SITE_URL`.
- [ ] **Step 4:** `npm install`. Run `npm run typecheck` (expected: passes on empty project — or the one error that no input files, acceptable pre-source).
- [ ] **Step 5:** Commit: `chore: scaffold next 14 + supabase + tooling`.

### Task 2: Design tokens, Tailwind, fonts, globals

**Files:**
- Create: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/format.ts`, `components.json`, `src/components/ui/*` (shadcn), `src/lib/utils.ts` (cn)

**Interfaces:**
- Produces: Tailwind theme extending the token palette (e.g. `bg-surface`, `text-muted`, `border-line`, `text-accent`, `bg-accent`, `font-display`, `font-mono`); `cn()` helper; shadcn `Button`, `Input`, `Card`, `DropdownMenu`, `Dialog`; `initials()`, `avatarColor()`, `formatDate()`, `formatNumber()` in `format.ts`.

- [ ] **Step 1:** `tailwind.config.ts` — map every token from Global Constraints to `theme.extend.colors` (semantic names: `paper`, `surface`, `ink`, `muted`, `label`, `faint`, `line`, `accent`, `accent-hover`, `ok`, `warn`, `danger`, `info`, plus their tints), `fontFamily` (`display` → Space Grotesk, `sans` → Inter, `mono` → IBM Plex Mono via CSS vars), `borderRadius`, `boxShadow` (`dropdown`, `drawer`), and the keyframes/animation from the comp.
- [ ] **Step 2:** `src/app/globals.css` — Tailwind directives; `:root` CSS variables for all tokens; base body (Inter, `--ink`, `--paper`, 14px/1.5, antialiased); link color `--accent`; selection; scrollbar styling; `*:focus-visible` ring; the six keyframes; `.skel` shimmer class; `@media (prefers-reduced-motion: reduce)` zeroing animations. Port verbatim from the comp `<style>` block, swapping literal hex for the token vars.
- [ ] **Step 3:** `src/app/layout.tsx` — load the three fonts via `next/font/google` (Space_Grotesk, Inter, IBM_Plex_Mono) exposing CSS vars; set `<html lang="en">`, body classes; render `{children}` + `<Toaster/>` (Toaster added in Task 18, import stubbed now as empty fragment then wired later). Metadata: title "Airlock", description from PRD one-liner.
- [ ] **Step 4:** Init shadcn (`components.json`) and add `button input card dropdown-menu dialog`; retheme each to tokens (accent = `#B25E09`, radius 9px). Add `src/lib/utils.ts` `cn()`.
- [ ] **Step 5:** `src/lib/format.ts` — `initials(name)`, `avatarColor(seed)` (deterministic pick from a fixed non-purple palette matching the comp's avatar backgrounds), `formatDate`, `formatRelative`, `formatNumber` (e.g. `1.24M`).
- [ ] **Step 6:** `npm run typecheck` + `npm run build` (expected: builds; a placeholder `page.tsx` may be needed — create a temporary redirect to `/login`). Commit: `feat: design tokens, tailwind theme, fonts, shadcn primitives`.

---

# Phase B — Database (the core deliverable)

### Task 3: Supabase local config + schema migration

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/0001_schema.sql`

- [ ] **Step 1:** `supabase/config.toml` — standard local config (project_id `airlock`, api port 54321, db port 54322, studio 54323, auth enabled, `enable_confirmations = false` so seeded users are usable). Keep minimal and CI-friendly.
- [ ] **Step 2:** `0001_schema.sql` — **copy verbatim** from the build prompt: `pgcrypto` extension, `org_role` enum, `organizations`, `memberships` (unique(org_id,user_id)), `projects`, and the three indexes.
- [ ] **Step 3:** Commit: `feat(db): schema — organizations, memberships, projects`.

### Task 4: Helper functions + create_organization RPC

**Files:**
- Create: `supabase/migrations/0002_functions.sql`

**Interfaces:**
- Produces (DB): `public.is_org_member(target_org uuid) → boolean`, `public.has_org_role(target_org uuid, roles org_role[]) → boolean`, `public.create_organization(org_name text, org_slug text) → organizations`. All `security definer`, `set search_path = public`; the two predicates `stable`.

- [ ] **Step 1:** `0002_functions.sql` — **copy verbatim** from the build prompt (both predicates + the plpgsql `create_organization` that inserts org then owner membership, raising if `auth.uid()` is null).
- [ ] **Step 2:** Commit: `feat(db): is_org_member, has_org_role, create_organization RPC`.

### Task 5: RLS policies

**Files:**
- Create: `supabase/migrations/0003_rls.sql`

- [ ] **Step 1:** `0003_rls.sql` — **copy verbatim**: enable RLS on all three tables; `organizations` SELECT `is_org_member(id)`; `memberships` SELECT `is_org_member(org_id)`; `projects` SELECT/INSERT/UPDATE/DELETE per the prompt (INSERT `with check`, UPDATE `using`+`with check`, DELETE `has_org_role(org_id, {owner,admin})`). **No INSERT policy** on organizations/memberships — intentional (creation via RPC).
- [ ] **Step 2:** Commit: `feat(db): enable RLS + policies on all tables`.

### Task 6: Bring up local stack + apply migrations (verification gate)

- [ ] **Step 1:** Ensure Supabase CLI + Docker available. Run `supabase start`. **If Docker is unavailable in this environment, record that and defer the live run to the user; still verify SQL parses by other means (e.g. `supabase db lint` or a Postgres container).**
- [ ] **Step 2:** `supabase db reset` (applies 0001→0003). Expected: no errors, RLS enabled.
- [ ] **Step 3:** Generate types: `supabase gen types typescript --local > src/lib/database.types.ts`. Commit: `feat(db): generated Database types`.

---

# Phase C — Isolation proof (the differentiator) — TDD

> This phase is written test-first. The tests encode the security contract; they must fail if RLS regresses. Uses anon key + real user sessions only — never service role in assertions.

### Task 7: Test helpers

**Files:**
- Create: `tests/helpers.ts`, `vitest.config.ts`

**Interfaces:**
- Produces: `makeAnonClient()` → fresh `SupabaseClient<Database>` (anon key, no persisted session); `createTestUser(email, password)` → admin-API creates a confirmed user, returns `{ id, email }`; `signIn(email, password)` → anon client with an authed session; `createOrgAs(client, name, slug)` → calls `create_organization` RPC, returns org row; `addProjectAs(client, orgId, name)` → inserts a project, returns row; `adminDeleteUsers()` / cleanup. Reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from env (dotenv). Service role used ONLY in `createTestUser`/cleanup, never in assertions.

- [ ] **Step 1:** `vitest.config.ts` — node environment, load `.env` via dotenv, single-threaded (`pool: 'forks'`, `poolOptions.forks.singleFork: true`) so setup ordering is deterministic; `testTimeout: 20000`.
- [ ] **Step 2:** Write `helpers.ts` exactly per the Interfaces above. `createTestUser` uses `createClient(url, serviceRoleKey).auth.admin.createUser({ email, password, email_confirm: true })`. `signIn` uses a fresh anon client `.auth.signInWithPassword`.
- [ ] **Step 3:** Commit: `test: isolation harness (anon clients, admin user creation)`.

### Task 8: Isolation suite — the 8 assertions

**Files:**
- Create: `tests/isolation.test.ts`

**Setup (`beforeAll`):** create User A (`a+<ts>@acme.test`), User B (`b+<ts>@globex.test`), Member M (`m+<ts>@acme.test`). A signs in → `create_organization('Acme Inc','acme-<ts>')` → project "Acme Alpha". B signs in → `create_organization('Globex Corp','globex-<ts>')` → project "Globex Beta". A (as owner) adds M to Acme as `member` (via a service-role insert into memberships in setup — membership creation is out of RLS scope by design; document this). Capture `acmeOrgId`, `globexOrgId`, `acmeProjectId`, `globexProjectId`. `afterAll`: clean up users.

- [ ] **Step 1:** Write all 8 tests (they will fail until the stack + migrations are up — that IS the red state):
  1. **A sees only Acme projects:** `A.from('projects').select('*')` → every row `.org_id === acmeOrgId`; Globex project id not present.
  2. **A cannot read Globex org:** `A.from('organizations').select('*').eq('id', globexOrgId)` → `data.length === 0`, no error.
  3. **A cannot read Globex memberships:** `A.from('memberships').select('*').eq('org_id', globexOrgId)` → `data.length === 0`.
  4. **A cannot insert into Globex:** `A.from('projects').insert({ org_id: globexOrgId, name:'x', created_by: A.id })` → `error` is non-null (RLS `with check` violation).
  5. **A update of Globex project → 0 rows:** `A.from('projects').update({ name:'hacked' }).eq('id', globexProjectId).select()` → `data.length === 0`.
  6. **A delete of Globex project → 0 rows:** `A.from('projects').delete().eq('id', globexProjectId).select()` → `data.length === 0`; assert (via service-role read) the Globex project still exists.
  7. **Positive control — A full CRUD in Acme:** insert a project (ok), select it (visible), update its name (row returned), delete it (row returned).
  8. **Role control:** M (member) `delete` on `acmeProjectId` → `data.length === 0` (blocked by `has_org_role`); A (owner) delete on a throwaway Acme project → row returned (allowed).
- [ ] **Step 2:** Run `npm run test:isolation`. **Expected once the local stack + migrations are up: all 8 pass.** If any assertion passes for the wrong reason (e.g. empty because of a query bug), tighten it. If Docker is unavailable here, mark this as the user-run gate and proceed; the SQL is copied verbatim from a reviewed spec.
- [ ] **Step 3:** Commit: `test: tenant-isolation suite — 8 assertions (npm run test:isolation)`.

### Task 9: Seed script

**Files:**
- Create: `supabase/seed.ts`

- [ ] **Step 1:** Using service role + admin API: create `owner@acme.test`, `owner@globex.test`, `member@acme.test` (password `Password123!`, confirmed). For each owner: sign in with anon client, call `create_organization` (`Acme Inc`/`acme`, `Globex Corp`/`globex`) — exercises the real RPC+RLS path — then insert 2–3 realistic projects (names/slugs like the comp's mock data). Add `member@acme.test` to Acme as `member` (service-role insert). Idempotent: check-or-create by email.
- [ ] **Step 2:** Print the demo logins block at the end.
- [ ] **Step 3:** `npm run seed` against local stack (or defer to user if no Docker). Commit: `feat: seed script — two orgs, projects, demo logins`.

---

# Phase D — CI

### Task 10: GitHub Actions isolation gate

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1:** Workflow on `push` + `pull_request`: checkout → `actions/setup-node@v4` (Node 20, cache npm) → `npm ci` → install Supabase CLI (`supabase/setup-cli@v1`) → `supabase start` → `supabase db reset` (apply migrations) → write `.env` from the CLI's printed anon/service keys → `npm run test:isolation` → also run `npm run typecheck` and `npm run build`. Fail the job on any failure.
- [ ] **Step 2:** Add the CI status badge markdown to a scratch note for the README (Task 20).
- [ ] **Step 3:** Commit: `ci: run tenant-isolation suite + typecheck + build on every push`.

---

# Phase E — Auth & Supabase clients

### Task 11: Supabase SSR clients + middleware + route guard

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`, `src/lib/active-org.ts`

**Interfaces:**
- Produces: `createClient()` (server, async, uses `cookies()` from `next/headers`); `createBrowserClient()` (browser); `updateSession(request)` (middleware helper: refresh session, return `NextResponse`, redirect unauthenticated users hitting `(app)` routes to `/login`, and signed-in users hitting `/login` to `/`); `getActiveOrgId()` / `setActiveOrgId(id)` (cookie `airlock-active-org`).

- [ ] **Step 1:** Implement the three `@supabase/ssr` clients per current docs (server client passes a `cookies` object with `getAll`/`setAll`; browser client via `createBrowserClient`). Type all as `SupabaseClient<Database>`.
- [ ] **Step 2:** `src/middleware.ts` with `matcher` excluding static assets; delegates to `updateSession`. Guard `(app)` routes.
- [ ] **Step 3:** `active-org.ts` cookie helpers.
- [ ] **Step 4:** `npm run typecheck`. Commit: `feat(auth): @supabase/ssr clients, session middleware, route guard`.

### Task 12: Auth callback + auth screen (login/signup/forgot/onboarding)

**Files:**
- Create: `src/app/auth/callback/route.ts`, `src/app/login/page.tsx` (+ a client `auth-form.tsx`), server actions `signInWithPassword`, `signUp`, `signInWithGoogle` in `src/app/actions.ts`

**Comp reference:** `<!-- AUTH -->` section — left form column + right dark `#10192A` panel ("One console. Every tenant, perfectly isolated." / "acting in: acme" in mono). States: sign in / sign up (name field) / forgot (email only) / onboarding CTA. Google + magic-link buttons present.

- [ ] **Step 1:** `auth/callback/route.ts` — exchange `code` for a session (`supabase.auth.exchangeCodeForSession`), redirect to `/`.
- [ ] **Step 2:** `login/page.tsx` (Server Component) renders the two-column layout with tokens; the interactive form is a client component that flips between sign-in/sign-up/forgot local state and calls the server actions. Render a **demo-credentials card** listing `owner@acme.test` / `owner@globex.test` / `Password123!` with copy buttons. Google button calls `signInWithOAuth({ provider:'google' })` (documented optional). Email+password is primary.
- [ ] **Step 3:** Server actions: `signInWithPassword` (redirect to `/` on success), `signUp` (create user, then `create_organization` onboarding or redirect), error surfaced via returned state. Validation states per comp (disabled+loading buttons, field errors).
- [ ] **Step 4:** `npm run build`. Manual: load `/login`, confirm design matches comp. Commit: `feat(auth): login/signup/forgot screen + OAuth callback + demo logins`.

---

# Phase F — App shell (design-faithful chrome)

### Task 13: Data queries + active-org resolution

**Files:**
- Create: `src/lib/queries.ts`

**Interfaces:**
- Produces (all typed, server-only): `getSessionUser()`; `getUserOrgs()` → `{ id, name, slug, role }[]` (join memberships→organizations for `auth.uid()`); `resolveActiveOrg()` → active org from cookie or first membership; `getProjects(orgId)`; `getProject(orgId, id)`; `getMembers(orgId)`; `getOverviewCounts(orgId)` (real project count, member count). All rely on RLS — no manual org filtering needed for security, but pass `orgId` for correctness/clarity.

- [ ] **Step 1:** Implement queries via the server client. Handle "user has no orgs" (→ onboarding). Type every return.
- [ ] **Step 2:** `npm run typecheck`. Commit: `feat: typed server-side queries + active-org resolution`.

### Task 14: Sidebar + org switcher + acting-in marker + collapse

**Files:**
- Create: `src/components/app-shell/sidebar.tsx`, `org-switcher.tsx`, `mobile-nav.tsx`; `src/app/(app)/layout.tsx`; server action `switchOrg` in `actions.ts`

**Comp reference:** `<!-- SIDEBAR -->` — org switcher (avatar + name + slug in mono + chevrons) at top with a "SWITCH ORGANIZATION" dropdown listing orgs (role in mono) + "New organization"; nav section "WORKSPACE" with items **Overview, Projects, Members, Usage, Audit log, Settings** (+ Billing per inventory) with icons and optional count badges; bottom **acting-in** marker (amber tinted `#FBF4EC`/`#F0DFC9`, "acting in {slug}") + Collapse toggle. Collapsed = 72px icons; mobile = drawer + backdrop.

- [ ] **Step 1:** `(app)/layout.tsx` (Server Component): `resolveActiveOrg()` + `getUserOrgs()`; if no orgs → redirect to onboarding. Render `<Sidebar orgs activeOrg/>`, `<Topbar/>`, `<Breadcrumbs/>`, `{children}` inside the flex shell with the reveal animation on route change.
- [ ] **Step 2:** `Sidebar` mostly server-rendered; `OrgSwitcher` and collapse are client (local open state; collapse persisted to a cookie). `switchOrg(orgId)` server action sets the active-org cookie and `revalidatePath('/')`.
- [ ] **Step 3:** Nav active state by pathname. Acting-in marker always reflects `activeOrg.slug` in mono.
- [ ] **Step 4:** `npm run build`. Commit: `feat(shell): sidebar, org switcher, acting-in marker, collapse, mobile drawer`.

### Task 15: Topbar (search/⌘K, bell, help, avatar) + breadcrumbs + command palette

**Files:**
- Create: `src/components/app-shell/topbar.tsx`, `breadcrumbs.tsx`, `command-palette.tsx`; server action `signOut`

**Comp reference:** `<!-- MAIN COLUMN -->` header (60px): ⌘K search trigger, help, notifications bell w/ dropdown + unread dot, avatar menu (Profile/Security/Sign out). Breadcrumb bar (40px): `{slug}` mono / crumb. `<!-- COMMAND PALETTE -->`: ⌘K modal, fuzzy list across orgs/projects/members/settings (mock nav).

- [ ] **Step 1:** `Topbar` (client for dropdowns): bell + avatar menus via shadcn dropdown-menu; notifications from `mock-data`. Avatar shows the user's initials (`AL` style). `signOut` action → `supabase.auth.signOut()` → redirect `/login`.
- [ ] **Step 2:** `Breadcrumbs` derives crumb from route; slug in mono.
- [ ] **Step 3:** `CommandPalette` (client): `⌘K`/`Ctrl+K` opens a shadcn dialog with an input + grouped results (orgs → switch, projects/members/settings → navigate). Fuzzy filter over a combined list (real orgs/projects/members + mock settings entries). Keyboard nav + reduced-motion respected.
- [ ] **Step 4:** `npm run build`. Commit: `feat(shell): topbar, breadcrumbs, ⌘K command palette`.

### Task 16: Toast system + shared primitives

**Files:**
- Create: `src/components/toast/toaster.tsx`, `use-toast.ts`; `src/components/primitives/{status-badge,role-badge,avatar,mono}.tsx`; wire `<Toaster/>` into root layout

**Comp reference:** `<!-- TOASTS -->` (success/error/info, `toastin` animation, top-right). Status/role pills use functional tints (ok `#E7F4EC`/`#067647`, warn, danger `#FEF3F2`/`#B42318`, neutral `#F2F4F7`/`#475467`).

- [ ] **Step 1:** Minimal toast context (`useToast`) + viewport; `toast({ title, variant })`; auto-dismiss; reduced-motion. No external toast lib.
- [ ] **Step 2:** `StatusBadge` (active/paused/archived/…), `RoleBadge` (owner/admin/member), `Avatar` (deterministic non-purple color from `avatarColor`), `Mono`.
- [ ] **Step 3:** `npm run build`. Commit: `feat(ui): toasts + status/role badges, avatar, mono primitives`.

---

# Phase G — Functional core screens (real Supabase + RLS)

### Task 17: Projects — table, board, filters, create/delete (WIRED)

**Files:**
- Create: `src/app/(app)/projects/page.tsx`; `components/projects/{project-table,project-board,view-toggle,project-filters,create-project-dialog,delete-project-dialog}.tsx`; server actions `createProject`, `deleteProject` in `actions.ts`

**Comp reference:** `<!-- PROJECTS -->` — header + Table|Board toggle + New project; toolbar (search + status filters); table (select-all + row checkboxes, sortable PROJECT/UPDATED, status pill, owner avatar, REQUESTS mono, pagination, bulk bar, empty state); board (3 status columns w/ cards). `<!-- MODALS -->` create-project (name→auto slug, description, validation) + delete-confirm (danger, names the org slug in mono).

- [ ] **Step 1:** `projects/page.tsx` (Server Component): `getProjects(activeOrg.id)`. Render `<ViewToggle>`, `<ProjectFilters>`, and either `<ProjectTable>` or `<ProjectBoard>`. View + filters + sort + selection + pagination are client-side state over the server-fetched rows (REQUESTS/status are mock-augmented per project since the schema has no such column — derive deterministically or from `mock-data`, and label clearly in README as presentational).
- [ ] **Step 2:** `createProject(formData)` server action: read active org from cookie, `insert({ org_id, name, description, created_by: uid })` — **RLS `with check` enforces membership; never trust a client org_id.** On success `revalidatePath('/projects')` + toast "Created". `create-project-dialog` (client) handles validation states.
- [ ] **Step 3:** `deleteProject(id)` server action: `delete().eq('id', id)` — **RLS `has_org_role` enforces owner/admin.** UI role-gates the button to match (UX only). `delete-project-dialog` confirms. `revalidatePath` + toast "Deleted".
- [ ] **Step 4:** Verify against comp; `npm run build`. If stack is up: create/delete a project logged in as Acme and confirm it persists and is org-scoped. Commit: `feat(projects): table+board, filters, create/delete via RLS-enforced actions`.

### Task 18: Project detail (tabs) — real metadata

**Files:**
- Create: `src/app/(app)/projects/[id]/page.tsx`

**Comp reference:** `<!-- PROJECT DETAIL -->` — back link, header (icon, name, status), tabs **Overview / Activity / Access / Settings**. Overview = stat cards + metadata (id/slug/created in mono). Access = member list w/ roles. Activity = feed (mock). Settings = name/slug form + danger zone (delete → deleteProject).

- [ ] **Step 1:** `getProject(activeOrg.id, params.id)` (RLS scopes it; 404 if not visible → `notFound()`). Real: name, slug/id, created_at, created_by, org members for Access. Mock: activity feed, per-project stats/requests.
- [ ] **Step 2:** Tabs are client state; Settings danger zone reuses `delete-project-dialog`. Save-changes shows toast (name/slug update wired via a `updateProject` action; slug is presentational unless added to schema — keep `name`/`description` real).
- [ ] **Step 3:** `npm run build`. Commit: `feat(projects): project detail tabs (real metadata + access)`.

### Task 19: Members + permissions matrix

**Files:**
- Create: `src/app/(app)/members/page.tsx`; `components/members/{members-table,invite-member-dialog,permissions-matrix}.tsx`

**Comp reference:** `<!-- MEMBERS -->` — members table (avatar, name, email mono, role badge, status, last active, search) + Invite button; permissions matrix (feature rows × role columns with checks); remove-member confirm.

- [ ] **Step 1:** `members/page.tsx` (Server Component): `getMembers(activeOrg.id)` (RLS-scoped; real name/email/role). `MembersTable` read-only per PRD (search is client-side). Last-active/status presentational.
- [ ] **Step 2:** `invite-member-dialog` (mock — email + role select, toast "Invitation sent"; documented as extension point, no real email). `permissions-matrix` from `mock-data` (static capability grid, reinforces access-control theme).
- [ ] **Step 3:** `npm run build`. Commit: `feat(members): members table + invite (mock) + permissions matrix`.

### Task 20: Overview dashboard (real counts + mock analytics)

**Files:**
- Create: `src/app/(app)/page.tsx`; `components/overview/{kpi-card,sparkline,area-chart,breakdown-bars,activity-feed}.tsx`

**Comp reference:** `<!-- OVERVIEW -->` — header + date-range + New project; KPI row (4 cards w/ sparklines + delta pills); "Requests over time" area chart + "Usage by project" bars; recent-activity feed (→ audit) + quick actions.

- [ ] **Step 1:** `page.tsx` (Server Component): `getOverviewCounts(activeOrg.id)` → **real** projects count + members count feed two KPI cards; the other KPIs (usage/active) + sparklines + area chart + breakdown + activity feed come from `mock-data` (deterministic, realistic). SVG charts are pure functions of data (path builders in `sparkline`/`area-chart`) — no chart lib.
- [ ] **Step 2:** Quick actions wire to real create-project dialog + invite (mock) + settings. Reveal animation on load.
- [ ] **Step 3:** `npm run build`. Commit: `feat(overview): dashboard — real counts + mock analytics`.

---

# Phase H — Mock screens (same finish, not wired)

> Each renders from `src/lib/mock-data.ts` (typed). Same components, tokens, states as real screens.

### Task 21: `mock-data.ts` fixtures

**Files:** Create `src/lib/mock-data.ts`

- [ ] **Step 1:** Typed fixtures: notifications, activity/audit events (actor, action, resource, tenant, ts), KPI/sparkline series, usage series + breakdown, billing (plan, usage-vs-limit, 3 tiers, invoices, payment method, credit balance), api keys, webhooks, sessions, permissions matrix, command-palette entries. Realistic copy (Acme/Globex, plausible names, mono IDs). Commit: `feat: typed mock-data fixtures`.

### Task 22: Billing (mock)

**Files:** Create `src/app/(app)/billing/page.tsx`
**Comp reference:** `<!-- BILLING -->` — current plan card, usage-vs-limit progress bars, 3-tier comparison, invoices table, payment method, credits widget.
- [ ] **Step 1:** Build from `mock-data`; match comp. `npm run build`. Commit: `feat(billing): mock billing & plans`.

### Task 23: Usage / analytics (mock)

**Files:** Create `src/app/(app)/usage/page.tsx`
**Comp reference:** `<!-- USAGE / ANALYTICS -->` — requests-over-time, top projects, member activity, date-range + filters.
- [ ] **Step 1:** Build; reuse chart components. `npm run build`. Commit: `feat(usage): mock analytics`.

### Task 24: Audit log (mock, isolation-themed)

**Files:** Create `src/app/(app)/audit/page.tsx`
**Comp reference:** `<!-- AUDIT LOG -->` — event table/timeline (actor, action, resource, tenant, ts in mono), filters, event-detail drawer with raw IDs in mono.
- [ ] **Step 1:** Build; emphasize tenant column + mono IDs (ties to isolation story). `npm run build`. Commit: `feat(audit): mock audit log`.

### Task 25: Settings (mock)

**Files:** Create `src/app/(app)/settings/page.tsx`
**Comp reference:** `<!-- SETTINGS -->` — left settings-nav + sections: Organization (name/slug/avatar/delete danger zone), Profile, Security (2FA, active sessions), API keys (generate/revoke, key in mono, copy), Webhooks, Notifications, Enterprise SSO. Responsive nav collapses to horizontal on mobile.
- [ ] **Step 1:** Build all sections from `mock-data`; API key/copy interactions show toasts. `npm run build`. Commit: `feat(settings): mock settings suite`.

---

# Phase I — Docs, verification, deploy

### Task 26: README

**Files:** Create `README.md`
- [ ] **Step 1:** One-paragraph pitch + CI badge. **Tenancy model** (org_id everywhere, membership-based access, DB is the boundary). **RLS design** (helper fns, why SECURITY DEFINER + pinned search_path, why org creation uses an RPC / no INSERT policy on organizations/memberships). **Scaling path** (JWT-claims RLS via custom access-token hook, trade-off = token re-issue on membership change). **Local setup** (`supabase start`, `db reset`, `npm run seed`), running isolation tests, the demo logins. **Which screens are real vs mock** (honesty section, mirrors the design brief mapping). **Deploy notes** (Vercel env vars + hosted Supabase). **Extension points** (invites, audit logging, JWT-claim RLS, per-resource sharing, soft deletes).
- [ ] **Step 2:** Commit: `docs: README — tenancy, RLS, scaling, setup, real-vs-mock`.

### Task 27: Full verification pass

- [ ] **Step 1:** `npm run typecheck` (no `any`, strict) → clean.
- [ ] **Step 2:** `npm run build` → succeeds.
- [ ] **Step 3:** `npm run test:isolation` → all 8 pass (against local stack; user-run if Docker unavailable here).
- [ ] **Step 4:** Manual/Playwright smoke: log in as Acme → see only Acme projects; switch to Globex (after seeding a membership) → different projects; create/delete a project; verify a member cannot delete. Reduced-motion + keyboard focus spot-check.
- [ ] **Step 5:** Final commit / branch ready for PR.

### Task 28: Deploy (user-gated)

- [ ] **Step 1:** Document + assist: create hosted Supabase project, push migrations (`supabase db push`), run seed against it; deploy to Vercel with env vars; set `NEXT_PUBLIC_SITE_URL` + Supabase redirect URLs. **Requires the user's accounts/secrets — do not attempt autonomously; offer to walk through it.**

---

## Self-Review

**Spec coverage (PRD §§ + build prompt):** schema/RLS/functions (Tasks 3–5, verbatim) ✓; `create_organization` atomic (Task 4) ✓; 8 isolation assertions (Task 8, 1:1 with PRD §8 / prompt list) ✓; CI gate (Task 10) ✓; seed + demo logins (Task 9) ✓; @supabase/ssr auth + middleware + callback (Tasks 11–12) ✓; login w/ demo creds + Google optional (Task 12) ✓; dashboard/org-switcher/projects/members real (Tasks 14,17–20) ✓; "How isolation works" → README section + audit screen (Tasks 24,26) ✓; full console mock screens (Tasks 21–25) ✓; README all subsections (Task 26) ✓; TS strict no-any, RLS-only authz (Global Constraints, enforced Task 27) ✓; design tokens/type/motion/a11y from comp+brief (Task 2 + per-screen) ✓; deploy notes (Task 28) ✓.

**Placeholder scan:** SQL and the 8 assertions are given in full; UI tasks reference exact comp section markers (the comp is the complete markup source at `docs/design/Airlock.dc.html`, not a placeholder). Mock content is centralized in Task 21 so no screen invents undefined data.

**Type consistency:** query names (`getUserOrgs`, `resolveActiveOrg`, `getProjects`, `getProject`, `getMembers`, `getOverviewCounts`) and action names (`createProject`, `deleteProject`, `switchOrg`, `createOrg`/onboarding, `signOut`, `updateProject`) are used consistently across Tasks 13–20. `Database` type (Task 6) flows through all clients/queries.

**Known environment risk:** `supabase start` needs Docker; if unavailable in this session, Tasks 6/8/9/27-live become user-run gates. All non-DB work (scaffold, tokens, UI, typecheck, build) proceeds regardless, and the SQL/tests are copied verbatim from a reviewed spec.
```
