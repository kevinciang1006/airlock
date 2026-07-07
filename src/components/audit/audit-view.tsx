"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { auditEvents, type AuditEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ACTIONS = ["all", "project", "member", "apikey", "pipeline"] as const;

export function AuditView({ orgSlug }: { orgSlug: string }) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<(typeof ACTIONS)[number]>("all");
  const [selected, setSelected] = React.useState<AuditEvent | null>(null);

  // Scope the mock events to the active tenant for realism.
  const events = React.useMemo(
    () => auditEvents.map((e) => ({ ...e, tenant: orgSlug })),
    [orgSlug],
  );

  const filtered = events.filter((e) => {
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      e.actor.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.resource.toLowerCase().includes(q);
    const matchesFilter = filter === "all" || e.action.startsWith(filter);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="animate-reveal">
      <div className="mb-5">
        <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Audit log</h1>
        <p className="mt-1 text-muted">
          Every scoped action in <span className="font-mono text-label">{orgSlug}</span>, with raw resource IDs.
        </p>
      </div>

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex h-[38px] min-w-[200px] max-w-[320px] flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3">
          <Search className="h-[15px] w-[15px] text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
        </div>
        {ACTIONS.map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={cn(
              "h-[38px] rounded-md border px-3 text-[13px] font-medium capitalize",
              filter === a
                ? "border-accent-tint-border bg-accent-tint text-accent-tint-fg"
                : "border-line bg-surface text-muted hover:bg-wash-hover",
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-wash-hover">
                {["Actor", "Action", "Resource", "Tenant", "Timestamp"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted first:pl-[18px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer border-b border-wash-track last:border-0 hover:bg-wash-hover"
                >
                  <td className="py-3 pl-[18px] pr-3 text-[13px] text-label">{e.actor}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-wash-track px-2 py-0.5 font-mono text-[12px] text-mid">
                      {e.action}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[12.5px] text-accent">{e.resource}</td>
                  <td className="px-3 py-3 font-mono text-[12.5px] text-muted">{e.tenant}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-faint">{e.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-muted">No events match your filters.</div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-[rgba(16,25,42,.4)] animate-fadein"
            aria-hidden
          />
          <aside className="fixed right-0 top-0 z-[80] flex h-screen w-[380px] max-w-[calc(100vw-32px)] animate-slideright flex-col border-l border-line bg-surface shadow-drawer">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-[15px] font-semibold text-ink">Event detail</span>
              <button
                onClick={() => setSelected(null)}
                className="flex h-7 w-7 items-center justify-center rounded-sm text-faint hover:bg-wash-hover"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {[
                ["Event ID", selected.id],
                ["Actor", selected.actor],
                ["Action", selected.action],
                ["Resource", selected.resource],
                ["Tenant", selected.tenant],
                ["IP address", selected.ip],
                ["Timestamp", selected.timestamp],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-wash-track py-3 last:border-0">
                  <div className="text-[12px] text-muted">{k}</div>
                  <div className="mt-0.5 font-mono text-[13px] text-ink">{v}</div>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
