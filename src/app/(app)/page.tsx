import { resolveActiveOrg } from "@/lib/queries";

// Placeholder Overview — replaced by the full dashboard in Phase G (Task 20).
export default async function OverviewPage() {
  const activeOrg = await resolveActiveOrg();
  return (
    <div className="animate-reveal">
      <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Overview</h1>
      <p className="mt-1 text-muted">
        Acting in <span className="font-medium text-label">{activeOrg?.name}</span>.
      </p>
    </div>
  );
}
