"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ChevronRight } from "lucide-react";
import { switchOrg } from "@/app/actions";
import type { UserOrg } from "@/lib/queries";
import { Avatar } from "@/components/primitives/avatar";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  run: () => void;
}

const NAV: ReadonlyArray<readonly [string, string]> = [
  ["Overview", "/"],
  ["Projects", "/projects"],
  ["Members", "/members"],
  ["Usage", "/usage"],
  ["Audit log", "/audit"],
  ["Billing", "/billing"],
  ["Settings", "/settings"],
];

export function CommandPalette({
  open,
  onOpenChange,
  orgs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgs: UserOrg[];
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [, startTransition] = React.useTransition();

  const entries = React.useMemo<Entry[]>(() => {
    const go = (href: string) => () => {
      onOpenChange(false);
      router.push(href);
    };
    const list: Entry[] = [];
    for (const [label, href] of NAV) list.push({ id: `nav:${href}`, group: "Navigate", label, run: go(href) });
    for (const o of orgs)
      list.push({
        id: `org:${o.id}`,
        group: "Switch organization",
        label: o.name,
        hint: o.slug,
        icon: <Avatar name={o.slug} variant="solid" size={20} />,
        run: () => {
          onOpenChange(false);
          startTransition(() => switchOrg(o.id));
        },
      });
    list.push({ id: "act:new-project", group: "Actions", label: "Create project", run: go("/projects") });
    list.push({ id: "act:invite", group: "Actions", label: "Invite member", run: go("/members") });
    list.push({ id: "act:apikey", group: "Actions", label: "Generate API key", run: go("/settings") });
    return list;
  }, [orgs, router, onOpenChange, startTransition]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        (e.hint ?? "").toLowerCase().includes(q) ||
        e.group.toLowerCase().includes(q),
    );
  }, [entries, query]);

  React.useEffect(() => setActive(0), [query, open]);

  // Global ⌘K / Ctrl+K
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  }

  const groups = Array.from(new Set(filtered.map((e) => e.group)));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-[rgba(16,25,42,.45)] data-[state=open]:animate-fadein" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[12vh] z-[90] w-[calc(100%-32px)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-surface shadow-drawer data-[state=open]:animate-pop">
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <div className="flex items-center gap-2.5 border-b border-line px-4">
            <Search className="h-4 w-4 text-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Search orgs, projects, members, settings…"
              className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
            />
            <span className="rounded border border-line bg-wash-hover px-1.5 py-0.5 font-mono text-[11px] text-muted">
              esc
            </span>
          </div>
          <div className="max-h-[52vh] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center text-[13px] text-muted">No results for “{query}”.</div>
            )}
            {groups.map((group) => (
              <div key={group} className="mb-1">
                <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                  {group}
                </div>
                {filtered
                  .filter((e) => e.group === group)
                  .map((e) => {
                    const idx = filtered.indexOf(e);
                    return (
                      <button
                        key={e.id}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => e.run()}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px]",
                          idx === active ? "bg-wash-hover text-ink" : "text-mid",
                        )}
                      >
                        {e.icon ?? <ChevronRight className="h-4 w-4 text-faint" />}
                        <span className="flex-1">{e.label}</span>
                        {e.hint && <span className="font-mono text-[11px] text-faint">{e.hint}</span>}
                        {idx === active && <CornerDownLeft className="h-3.5 w-3.5 text-faint" />}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
