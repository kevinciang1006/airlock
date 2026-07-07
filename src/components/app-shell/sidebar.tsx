"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FolderKanban,
  Users,
  BarChart3,
  ScrollText,
  CreditCard,
  Settings,
  ChevronsUpDown,
  ChevronsLeft,
  Plus,
  Check,
} from "lucide-react";
import { switchOrg, toggleSidebar } from "@/app/actions";
import type { UserOrg } from "@/lib/queries";
import { Avatar } from "@/components/primitives/avatar";
import { CreateOrgDialog } from "./create-org-dialog";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/members", label: "Members", icon: Users },
  { href: "/usage", label: "Usage", icon: BarChart3 },
  { href: "/audit", label: "Audit log", icon: ScrollText },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  orgs,
  activeOrg,
  collapsed: initialCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  orgs: UserOrg[];
  activeOrg: UserOrg;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(initialCollapsed);
  const [, startTransition] = React.useTransition();
  const showLabels = !collapsed;

  function handleToggle() {
    const next = !collapsed;
    setCollapsed(next);
    startTransition(() => toggleSidebar(next));
  }

  return (
    <aside
      className={cn(
        "z-[70] flex flex-shrink-0 flex-col border-r border-line bg-surface transition-[width,transform] duration-200",
        "max-md:fixed max-md:left-0 max-md:top-0 max-md:h-screen max-md:w-[248px] max-md:shadow-drawer",
        mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
      )}
      style={{ width: collapsed ? 72 : 248 }}
    >
      {/* Org switcher */}
      <div className="border-b border-line p-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-[10px] border border-line bg-surface p-2 text-left hover:bg-wash-hover">
              <Avatar name={activeOrg.slug} variant="solid" size={30} />
              {showLabels && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold text-ink">{activeOrg.name}</div>
                    <div className="font-mono text-[11px] text-muted">{activeOrg.slug}</div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-faint" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            <DropdownMenuLabel>Switch organization</DropdownMenuLabel>
            {orgs.map((o) => (
              <DropdownMenuItem
                key={o.id}
                onSelect={() => startTransition(() => switchOrg(o.id))}
                className="gap-2.5"
              >
                <Avatar name={o.slug} variant="solid" size={26} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{o.name}</div>
                  <div className="font-mono text-[10.5px] text-muted">{o.slug}</div>
                </div>
                {o.id === activeOrg.id ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <span className="font-mono text-[10px] uppercase text-faint">{o.role}</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <CreateOrgDialog>
              <button className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[13px] font-medium text-label hover:bg-wash-hover">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border border-dashed border-line-strong2 text-faint">
                  <Plus className="h-4 w-4" />
                </span>
                New organization
              </button>
            </CreateOrgDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2.5">
        {showLabels && (
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
            Workspace
          </div>
        )}
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={item.label}
              className={cn(
                "mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium",
                active ? "bg-accent-tint text-accent-tint-fg" : "text-mid hover:bg-wash-hover",
                collapsed && "justify-center",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", active && "text-accent")} />
              {showLabels && <span className="flex-1">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Acting-in marker + collapse */}
      <div className="border-t border-line p-2.5">
        {showLabels && (
          <div className="mb-2 flex items-center gap-2 rounded-md border border-accent-tint-border bg-accent-tint px-2.5 py-2">
            <span className="h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(178,94,9,.15)]" />
            <span className="text-[11.5px] text-accent-tint-fg">
              acting in <span className="font-mono font-semibold text-accent-hover">{activeOrg.slug}</span>
            </span>
          </div>
        )}
        <button
          onClick={handleToggle}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-muted hover:bg-wash-hover",
            collapsed && "justify-center",
          )}
        >
          <ChevronsLeft
            className={cn("h-[18px] w-[18px] flex-shrink-0 transition-transform", collapsed && "rotate-180")}
          />
          {showLabels && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
