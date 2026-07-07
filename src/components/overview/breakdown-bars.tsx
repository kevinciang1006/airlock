import { usageBreakdown } from "@/lib/mock-data";

export function BreakdownBars() {
  return (
    <div className="rounded-lg border border-line bg-surface p-[18px]">
      <div className="mb-4 text-[15px] font-semibold text-ink">Usage by project</div>
      {usageBreakdown.map((b) => (
        <div key={b.slug} className="mb-3.5 last:mb-0">
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="font-mono text-label">{b.slug}</span>
            <span className="text-muted">{b.pct}%</span>
          </div>
          <div className="h-[7px] overflow-hidden rounded-full bg-wash-track">
            <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
