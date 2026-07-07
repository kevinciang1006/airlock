"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, HelpCircle, Bell } from "lucide-react";
import { signOut } from "@/app/actions";
import { notifications } from "@/lib/mock-data";
import { initials } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Topbar({
  userName,
  userEmail,
  onOpenMobileNav,
  onOpenCmdk,
}: {
  userName: string;
  userEmail: string;
  onOpenMobileNav: () => void;
  onOpenCmdk: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();

  return (
    <header className="flex h-[60px] flex-shrink-0 items-center gap-3.5 border-b border-line bg-surface px-5">
      <button
        onClick={onOpenMobileNav}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-label md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <button
        onClick={onOpenCmdk}
        className="flex h-[38px] max-w-[440px] flex-1 items-center gap-2.5 rounded-md border border-line bg-wash-hover px-3 text-[13.5px] text-faint hover:bg-wash-track"
      >
        <Search className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate whitespace-nowrap text-left">Search or jump to…</span>
        <span className="hidden flex-shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted sm:inline">
          ⌘K
        </span>
      </button>

      <div className="flex-1" />

      <button
        className="flex h-[38px] w-[38px] items-center justify-center rounded-md border border-line bg-surface text-muted"
        title="Help"
      >
        <HelpCircle className="h-[18px] w-[18px]" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-md border border-line bg-surface text-muted"
            title="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-[7px] h-[7px] w-[7px] rounded-full border-[1.5px] border-surface bg-danger" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[340px] p-0">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-3">
            <span className="text-[14px] font-semibold text-ink">Notifications</span>
            <button className="text-[12px] text-accent hover:text-accent-hover">Mark all read</button>
          </div>
          {notifications.map((n) => (
            <div key={n.id} className="flex gap-2.5 border-b border-wash-track px-3.5 py-3 last:border-0">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: n.dot }} />
              <div>
                <div className="text-[13px] text-ink">{n.text}</div>
                <div className="mt-0.5 font-mono text-[11px] text-faint">{n.time}</div>
              </div>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 w-px bg-line" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md bg-panel font-display text-[12px] font-semibold text-white">
            {initials(userName || userEmail)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[230px]">
          <div className="px-2.5 pb-2 pt-1.5">
            <div className="text-[13.5px] font-semibold text-ink">{userName || "Your account"}</div>
            <div className="font-mono text-[11px] text-muted">{userEmail}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/settings")}>Profile settings</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/settings")}>Security</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => startTransition(() => signOut())}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
