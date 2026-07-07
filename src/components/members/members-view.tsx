"use client";

import * as React from "react";
import { Search, Plus } from "lucide-react";
import type { OrgRole } from "@/lib/database.types";
import { Avatar } from "@/components/primitives/avatar";
import { RoleBadge } from "@/components/primitives/role-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { InviteMemberDialog } from "./invite-member-dialog";
import { PermissionsMatrix } from "./permissions-matrix";

export interface MemberDisplay {
  userId: string;
  name: string | null;
  email: string | null;
  role: OrgRole;
  joinedAt: string;
}

const LAST_ACTIVE = ["2h ago", "just now", "1d ago", "3h ago", "5d ago", "12m ago"];
function lastActive(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return LAST_ACTIVE[Math.abs(h) % LAST_ACTIVE.length] ?? "recently";
}

export function MembersView({
  members,
  orgName,
  canInvite,
}: {
  members: MemberDisplay[];
  orgName: string;
  canInvite: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => (m.name ?? "").toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q),
    );
  }, [members, search]);

  return (
    <div className="animate-reveal">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Members</h1>
          <p className="mt-1 text-muted">
            {members.length} {members.length === 1 ? "member" : "members"} in {orgName}
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> Invite member
          </Button>
        )}
      </div>

      <div className="mb-3.5 flex h-[38px] max-w-[320px] items-center gap-2 rounded-md border border-line bg-surface px-3">
        <Search className="h-[15px] w-[15px] text-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members…"
          className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
        />
      </div>

      <div className="mb-4 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-wash-hover">
                {["Member", "Role", "Status", "Last active", "Joined"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted ${
                      i === 0 ? "pl-[18px] text-left" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.userId} className="border-b border-wash-track last:border-0">
                  <td className="py-3 pl-[18px] pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.name ?? m.email ?? m.userId} size={32} />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-medium text-ink">{m.name ?? "Member"}</div>
                        <div className="truncate font-mono text-[11.5px] text-faint">{m.email ?? m.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-mid">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Active
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] text-faint">{lastActive(m.userId)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-faint">{formatDate(m.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PermissionsMatrix />

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
