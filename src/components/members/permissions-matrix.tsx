import { Check, Minus } from "lucide-react";

/**
 * Static capability grid. The projects rows mirror the *real* RLS
 * (members can create but not delete — has_org_role owner/admin), tying the
 * mock UI back to the enforced model.
 */
const ROLES = ["Owner", "Admin", "Member"] as const;

const CAPABILITIES: Array<{ label: string; grants: [boolean, boolean, boolean] }> = [
  { label: "View projects", grants: [true, true, true] },
  { label: "Create projects", grants: [true, true, true] },
  { label: "Delete projects", grants: [true, true, false] },
  { label: "Invite members", grants: [true, true, false] },
  { label: "Manage org settings", grants: [true, true, false] },
  { label: "Manage API keys", grants: [true, true, false] },
  { label: "Manage billing", grants: [true, false, false] },
];

export function PermissionsMatrix() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-[18px] py-4">
        <div className="text-[15px] font-semibold text-ink">Permissions</div>
        <div className="mt-0.5 text-[13px] text-muted">What each role can do in this organization.</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-wash-hover">
              <th className="px-[18px] py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Capability
              </th>
              {ROLES.map((r) => (
                <th
                  key={r}
                  className="px-3 py-3 text-center text-[11.5px] font-semibold uppercase tracking-wide text-muted"
                >
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap) => (
              <tr key={cap.label} className="border-b border-wash-track last:border-0">
                <td className="px-[18px] py-3 text-[13.5px] text-label">{cap.label}</td>
                {cap.grants.map((granted, i) => (
                  <td key={i} className="px-3 py-3 text-center">
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
