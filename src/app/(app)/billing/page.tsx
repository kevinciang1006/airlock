import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  currentPlan,
  usageLimits,
  plans,
  invoices,
  paymentMethod,
  creditBalance,
} from "@/lib/mock-data";

export default function BillingPage() {
  const creditsPct = Math.round((creditBalance.credits / creditBalance.total) * 100);

  return (
    <div className="animate-reveal">
      <div className="mb-5">
        <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Billing</h1>
        <p className="mt-1 text-muted">Manage your plan, usage, and invoices.</p>
      </div>

      {/* Current plan + credits */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px] text-muted">Current plan</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[26px] font-semibold text-ink">{currentPlan.name}</span>
                <span className="text-[14px] text-muted">
                  {currentPlan.price} {currentPlan.cadence}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-muted">Renews {currentPlan.renewal}</div>
            </div>
            <Button variant="secondary">Manage plan</Button>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="text-[13px] text-muted">Credit balance</div>
          <div className="mt-1 font-display text-[26px] font-semibold text-ink">
            {formatNumber(creditBalance.credits)}
          </div>
          <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-wash-track">
            <div className="h-full rounded-full bg-accent" style={{ width: `${creditsPct}%` }} />
          </div>
          <div className="mt-1.5 text-[12px] text-muted">
            of {formatNumber(creditBalance.total)} credits · resets monthly
          </div>
        </div>
      </div>

      {/* Usage vs limit */}
      <div className="mb-4 rounded-lg border border-line bg-surface p-[18px]">
        <div className="mb-4 text-[15px] font-semibold text-ink">Usage this period</div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {usageLimits.map((u) => {
            const pct = Math.min(100, Math.round((u.used / u.limit) * 100));
            const near = pct >= 80;
            return (
              <div key={u.label}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-label">{u.label}</span>
                  <span className="font-mono text-muted">
                    {formatNumber(u.used)}
                    {u.unit} / {formatNumber(u.limit)}
                    {u.unit}
                  </span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-wash-track">
                  <div
                    className={cn("h-full rounded-full", near ? "bg-warn" : "bg-accent")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3" data-plans>
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              "rounded-lg border bg-surface p-[18px]",
              p.current ? "border-accent shadow-card" : "border-line",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-ink">{p.name}</span>
              {p.current && (
                <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-semibold text-accent-tint-fg">
                  Current
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-[26px] font-semibold text-ink">{p.price}</span>
              <span className="text-[13px] text-muted">{p.cadence}</span>
            </div>
            <ul className="mt-3.5 flex flex-col gap-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-mid">
                  <Check className="h-4 w-4 flex-shrink-0 text-ok" /> {f}
                </li>
              ))}
            </ul>
            <Button
              variant={p.current ? "secondary" : "primary"}
              disabled={p.current}
              className="mt-4 w-full"
            >
              {p.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Invoices + payment method */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-[18px] py-4 text-[15px] font-semibold text-ink">Invoices</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse">
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-wash-track last:border-0">
                    <td className="px-[18px] py-3 font-mono text-[12.5px] text-label">{inv.id}</td>
                    <td className="px-3 py-3 text-[13px] text-muted">{inv.date}</td>
                    <td className="px-3 py-3 font-mono text-[13px] text-label">{inv.amount}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
                          inv.status === "paid" ? "bg-ok-tint text-ok" : "bg-warn-tint text-warn",
                        )}
                      >
                        {inv.status === "paid" ? "Paid" : "Open"}
                      </span>
                    </td>
                    <td className="px-[18px] py-3 text-right">
                      <button className="text-[12.5px] text-accent hover:text-accent-hover">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="mb-3 text-[15px] font-semibold text-ink">Payment method</div>
          <div className="flex items-center gap-3 rounded-md border border-line bg-wash-hover px-3.5 py-3">
            <div className="flex h-8 w-11 items-center justify-center rounded bg-panel font-display text-[11px] font-bold text-white">
              {paymentMethod.brand}
            </div>
            <div className="flex-1">
              <div className="font-mono text-[13px] text-ink">•••• {paymentMethod.last4}</div>
              <div className="text-[12px] text-muted">Expires {paymentMethod.exp}</div>
            </div>
          </div>
          <Button variant="secondary" className="mt-3 w-full">
            Update card
          </Button>
        </div>
      </div>
    </div>
  );
}
