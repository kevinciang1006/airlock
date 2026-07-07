"use client";

import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  "/": "Overview",
  "/projects": "Projects",
  "/members": "Members",
  "/usage": "Usage",
  "/audit": "Audit log",
  "/billing": "Billing",
  "/settings": "Settings",
};

function crumbFor(pathname: string): string {
  if (LABELS[pathname]) return LABELS[pathname] as string;
  if (pathname.startsWith("/projects/")) return "Project detail";
  const seg = pathname.split("/")[1];
  return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "Overview";
}

export function Breadcrumbs({ activeOrgSlug }: { activeOrgSlug: string }) {
  const pathname = usePathname();
  return (
    <div className="flex h-10 flex-shrink-0 items-center gap-2 border-b border-line bg-surface px-6 text-[12.5px] text-muted">
      <span className="font-mono text-faint">{activeOrgSlug}</span>
      <span className="text-line-strong">/</span>
      <span className="font-medium text-ink">{crumbFor(pathname)}</span>
    </div>
  );
}
