import { AreaChart } from "@/components/overview/area-chart";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { usageSeries, memberActivitySeries, topProjects } from "@/lib/mock-data";

export default function UsagePage() {
  return (
    <div className="animate-reveal">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Usage</h1>
          <p className="mt-1 text-muted">API activity and consumption across projects.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary">Last 30 days ▾</Button>
          <Button variant="secondary">Export CSV</Button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-line bg-surface p-[18px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold text-ink">Requests over time</div>
            <div className="mt-0.5 text-[12.5px] text-muted">All projects · UTC</div>
          </div>
          <div className="font-mono text-[12px] font-semibold text-accent">1.24M total</div>
        </div>
        <AreaChart values={usageSeries} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="mb-4 text-[15px] font-semibold text-ink">Top projects</div>
          {topProjects.map((p) => (
            <div key={p.slug} className="mb-3.5 last:mb-0">
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="font-mono text-label">{p.slug}</span>
                <span className="font-mono text-muted">{formatNumber(p.requests)}</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-wash-track">
                <div className="h-full rounded-full bg-accent" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[15px] font-semibold text-ink">Member activity</div>
            <div className="font-mono text-[12px] font-semibold text-info">+14% WoW</div>
          </div>
          <AreaChart values={memberActivitySeries} />
        </div>
      </div>
    </div>
  );
}
