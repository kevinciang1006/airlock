import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  good,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
  spark: number[];
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-[18px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {delta ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
              good ? "bg-ok-tint text-ok" : "bg-danger-tint text-danger",
            )}
          >
            {delta}
          </span>
        ) : (
          <span className="rounded-full bg-wash-track px-2 py-0.5 text-[11.5px] font-semibold text-muted">
            live
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-[30px] font-semibold tracking-[-.02em] text-ink">{value}</div>
      <Sparkline values={spark} className="mt-2 h-[34px] w-full" />
    </div>
  );
}
