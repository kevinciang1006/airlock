import { redirect } from "next/navigation";
import { getSessionUser, getUserOrgs, resolveActiveOrg } from "@/lib/queries";
import { getSidebarCollapsed } from "@/lib/active-org";
import { AppShell } from "@/components/app-shell/app-shell";
import { Onboarding } from "@/components/app-shell/onboarding";

// Every app route is per-session (cookies + auth) — always render on demand.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const orgs = await getUserOrgs();
  if (orgs.length === 0) return <Onboarding />;

  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return <Onboarding />;

  const collapsed = getSidebarCollapsed();
  const meta = user.user_metadata as { full_name?: unknown };
  const userName = typeof meta.full_name === "string" ? meta.full_name : "";

  return (
    <AppShell
      orgs={orgs}
      activeOrg={activeOrg}
      collapsed={collapsed}
      userName={userName}
      userEmail={user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
