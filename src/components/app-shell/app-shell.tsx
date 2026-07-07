"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";
import type { UserOrg } from "@/lib/queries";

export function AppShell({
  orgs,
  activeOrg,
  collapsed,
  userName,
  userEmail,
  children,
}: {
  orgs: UserOrg[];
  activeOrg: UserOrg;
  collapsed: boolean;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [cmdkOpen, setCmdkOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper">
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-[65] bg-[rgba(16,25,42,.4)] md:hidden"
          aria-hidden
        />
      )}

      <Sidebar
        orgs={orgs}
        activeOrg={activeOrg}
        collapsed={collapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={userName}
          userEmail={userEmail}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenCmdk={() => setCmdkOpen(true)}
        />
        <Breadcrumbs activeOrgSlug={activeOrg.slug} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-content px-6 pb-20 pt-7">{children}</div>
        </main>
      </div>

      <CommandPalette open={cmdkOpen} onOpenChange={setCmdkOpen} orgs={orgs} />
    </div>
  );
}
