import { cookies } from "next/headers";

const ACTIVE_ORG_COOKIE = "airlock-active-org";
const SIDEBAR_COOKIE = "airlock-sidebar-collapsed";

/** The org the user is currently acting in (or undefined → default to first). */
export function getActiveOrgId(): string | undefined {
  return cookies().get(ACTIVE_ORG_COOKIE)?.value;
}

/** Set the active org. Call from a Server Action or Route Handler only. */
export function setActiveOrgId(orgId: string): void {
  cookies().set(ACTIVE_ORG_COOKIE, orgId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Sidebar collapsed state (persisted so it survives navigation). */
export function getSidebarCollapsed(): boolean {
  return cookies().get(SIDEBAR_COOKIE)?.value === "1";
}

export function setSidebarCollapsed(collapsed: boolean): void {
  cookies().set(SIDEBAR_COOKIE, collapsed ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
