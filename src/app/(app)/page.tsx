import { resolveActiveOrg, getOverviewCounts } from "@/lib/queries";
import { kpis, usageSeries } from "@/lib/mock-data";
import { KpiCard } from "@/components/overview/kpi-card";
import { AreaChart } from "@/components/overview/area-chart";
import { BreakdownBars } from "@/components/overview/breakdown-bars";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { QuickActions } from "@/components/overview/quick-actions";

export default async function OverviewPage() {
  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return null;

  // Real counts drive two cards; the rest are mock analytics.
  const counts = await getOverviewCounts(activeOrg.id);
  const usageKpi = kpis[1]!;
  const activeKpi = kpis[0]!;

  return (
    <div className="animate-reveal">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Overview</h1>
          <p className="mt-1 text-muted">
            Everything happening in <span className="font-medium text-label">{activeOrg.name}</span> this week.
          </p>
        </div>
      </div>

      {/* KPIs — Projects + Members are real; Usage + Active are mock */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Projects" value={String(counts.projects)} delta="" good spark={[2, 3, 3, 4, 4, 5, counts.projects || 5]} />
        <KpiCard label="Members" value={String(counts.members)} delta="" good spark={[1, 1, 2, 2, 2, 3, counts.members || 3]} />
        <KpiCard {...usageKpi} />
        <KpiCard {...activeKpi} />
      </div>

      {/* Charts */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-ink">Requests over time</div>
              <div className="mt-0.5 text-[12.5px] text-muted">API requests across all projects</div>
            </div>
            <div className="font-mono text-[12px] font-semibold text-accent">1.24M total</div>
          </div>
          <AreaChart values={usageSeries} />
          <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-faint">
            <span>Jun 8</span>
            <span>Jun 15</span>
            <span>Jun 22</span>
            <span>Jun 29</span>
            <span>Jul 6</span>
          </div>
        </div>
        <BreakdownBars />
      </div>

      {/* Activity + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <ActivityFeed />
        <QuickActions />
      </div>
    </div>
  );
}
