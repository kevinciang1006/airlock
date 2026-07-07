import { cn } from "@/lib/utils";
import type { OrgRole } from "@/lib/database.types";

const STYLES: Record<OrgRole, string> = {
  owner: "bg-accent-tint text-accent-tint-fg",
  admin: "bg-info-tint text-info",
  member: "bg-wash-track text-mid",
};

const LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function RoleBadge({ role, className }: { role: OrgRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
        STYLES[role],
        className,
      )}
    >
      {LABELS[role]}
    </span>
  );
}
