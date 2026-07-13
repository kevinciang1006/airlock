import { Check, Minus } from "lucide-react";
import type { OrgRole } from "@/lib/database.types";
import { RoleBadge } from "@/components/primitives/role-badge";
import { cn } from "@/lib/utils";

/**
 * Capability grid, personalised to the signed-in user's role. The projects rows
 * mirror the *real* RLS (members can create but not delete — has_org_role
 * owner/admin), and the current role's column is highlighted with a plain-
 * language summary so the enforced limits are obvious, not buried.
 */
const ROLES: OrgRole[] = ["owner", "admin", "member"];
const ROLE_LABELS: Record<OrgRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };

const CAPABILITIES: Array<{ label: string; grants: [boolean, boolean, boolean] }> = [
  { label: "View projects", grants: [true, true, true] },
  { label: "Create projects", grants: [true, true, true] },
  { label: "Delete projects", grants: [true, true, false] },
  { label: "Invite members", grants: [true, true, false] },
  { label: "Manage org settings", grants: [true, true, false] },
  { label: "Manage API keys", grants: [true, true, false] },
  { label: "Manage billing", grants: [true, false, false] },
];

/** "delete projects, invite members, and manage billing" — first letter lowered. */
function listPhrase(items: string[]): string {
  const parts = items.map((s) => s.charAt(0).toLowerCase() + s.slice(1));
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function PermissionsMatrix({ currentRole }: { currentRole: OrgRole }) {
  const roleIdx = ROLES.indexOf(currentRole);
  const can = CAPABILITIES.filter((c) => c.grants[roleIdx]).map((c) => c.label);
  const cannot = CAPABILITIES.filter((c) => !c.grants[roleIdx]).map((c) => c.label);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-[18px] py-4">
        <div className="text-[15px] font-semibold text-ink">Permissions</div>
        <div className="mt-0.5 text-[13px] text-muted">What each role can do in this organization.</div>
      </div>

      {/* Personalised callout for the signed-in user. */}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 border-b border-accent-tint-border bg-accent-tint px-[18px] py-3 text-[13px] text-accent-tint-fg">
        <span>You're signed in as</span>
        <RoleBadge role={currentRole} className="translate-y-0.5" />
        <span>
          — you can <span className="font-semibold">{listPhrase(can)}</span>
          {cannot.length > 0 ? (
            <>
              , but <span className="font-semibold text-danger">can't</span> {listPhrase(cannot)}.
            </>
          ) : (
            <> — full access.</>
          )}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-wash-hover">
              <th className="px-[18px] py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Capability
              </th>
              {ROLES.map((r, i) => (
                <th
                  key={r}
                  className={cn(
                    "px-3 py-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-muted",
                    i === roleIdx && "bg-accent-tint text-accent-tint-fg",
                  )}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {ROLE_LABELS[r]}
                    {i === roleIdx && (
                      <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                        YOU
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap) => (
              <tr key={cap.label} className="border-b border-wash-track last:border-0">
                <td className="px-[18px] py-3 text-[13.5px] text-label">{cap.label}</td>
                {cap.grants.map((granted, i) => (
                  <td
                    key={i}
                    className={cn("px-3 py-3 text-center", i === roleIdx && "bg-accent-tint")}
                  >
                    {granted ? (
                      <Check className="mx-auto h-[18px] w-[18px] text-ok" />
                    ) : (
                      <Minus className="mx-auto h-[18px] w-[18px] text-line-strong" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
