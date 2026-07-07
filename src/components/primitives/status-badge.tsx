import { cn } from "@/lib/utils";

export type ProjectStatus = "active" | "paused" | "archived";

const STYLES: Record<ProjectStatus, string> = {
  active: "bg-ok-tint text-ok",
  paused: "bg-warn-tint text-warn",
  archived: "bg-wash-track text-mid",
};

const LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
