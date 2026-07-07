/**
 * Typed fixtures for the *mock* surfaces (everything that isn't the wired
 * Supabase core). Realistic copy on purpose — generic placeholders read as a
 * template. Extended in Phase H for billing/usage/settings.
 */

export interface Notification {
  id: string;
  text: string;
  time: string;
  dot: string;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  resource: string;
  tenant: string;
  timestamp: string;
  ip: string;
}

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  deltaDir: "up" | "down";
  spark: number[];
}

export interface UsageBreakdown {
  slug: string;
  pct: number;
  color: string;
}

export const notifications: Notification[] = [
  { id: "n1", text: "Marvin Minsky joined Acme Inc as a member", time: "12m ago", dot: "#067647" },
  { id: "n2", text: "Deploy to Payments API completed", time: "1h ago", dot: "#1257A0" },
  { id: "n3", text: "API key acme_live_… was created", time: "3h ago", dot: "#B25E09" },
  { id: "n4", text: "Usage reached 80% of the Team plan limit", time: "yesterday", dot: "#B54708" },
];

export const activity: ActivityEvent[] = [
  { id: "a1", actor: "Ada Lovelace", action: "created project", target: "payments-api", time: "12m ago" },
  { id: "a2", actor: "Marvin Minsky", action: "was invited to", target: "acme", time: "1h ago" },
  { id: "a3", actor: "Ada Lovelace", action: "rotated API key on", target: "web-dashboard", time: "3h ago" },
  { id: "a4", actor: "System", action: "ran nightly ETL for", target: "data-pipeline", time: "6h ago" },
  { id: "a5", actor: "Ada Lovelace", action: "updated settings for", target: "acme", time: "yesterday" },
];

export const auditEvents: AuditEvent[] = [
  {
    id: "evt_8Fk2",
    actor: "ada@acme.test",
    action: "project.create",
    resource: "prj_payments_api",
    tenant: "acme",
    timestamp: "2026-07-07 09:41:22",
    ip: "203.0.113.24",
  },
  {
    id: "evt_7Ba1",
    actor: "ada@acme.test",
    action: "member.invite",
    resource: "usr_marvin",
    tenant: "acme",
    timestamp: "2026-07-07 08:12:04",
    ip: "203.0.113.24",
  },
  {
    id: "evt_6Zc9",
    actor: "ada@acme.test",
    action: "apikey.create",
    resource: "key_live_4f2a",
    tenant: "acme",
    timestamp: "2026-07-06 22:03:55",
    ip: "198.51.100.9",
  },
  {
    id: "evt_5Yd3",
    actor: "system",
    action: "pipeline.run",
    resource: "prj_data_pipeline",
    tenant: "acme",
    timestamp: "2026-07-06 03:00:00",
    ip: "10.0.0.1",
  },
  {
    id: "evt_4Xe7",
    actor: "ada@acme.test",
    action: "project.update",
    resource: "prj_web_dashboard",
    tenant: "acme",
    timestamp: "2026-07-05 17:48:31",
    ip: "203.0.113.24",
  },
];

/** KPI cards; `spark` is a 0..1-ish series the sparkline turns into a path. */
export const kpis: Kpi[] = [
  { label: "Active this week", value: "3", delta: "+1", deltaDir: "up", spark: [4, 5, 4, 6, 7, 6, 8] },
  { label: "Usage this month", value: "1.24M", delta: "+18%", deltaDir: "up", spark: [3, 4, 6, 5, 7, 8, 9] },
  { label: "API keys", value: "5", delta: "+2", deltaDir: "up", spark: [1, 1, 2, 3, 3, 4, 5] },
  { label: "Errors (24h)", value: "12", delta: "-38%", deltaDir: "down", spark: [9, 8, 7, 6, 5, 4, 3] },
];

/** Area chart series — daily API requests over ~5 weeks. */
export const usageSeries: number[] = [
  22, 28, 25, 31, 35, 30, 38, 42, 39, 46, 44, 52, 49, 55, 61, 58, 64, 60, 68, 72, 69, 74, 80, 77, 83, 88, 84, 91,
  96, 93, 101,
];

export const usageBreakdown: UsageBreakdown[] = [
  { slug: "payments-api", pct: 42, color: "#B25E09" },
  { slug: "web-dashboard", pct: 27, color: "#1257A0" },
  { slug: "data-pipeline", pct: 18, color: "#067647" },
  { slug: "internal-tools", pct: 9, color: "#B54708" },
  { slug: "sandbox", pct: 4, color: "#98A2B3" },
];
