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
  good: boolean;
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
  { label: "Active this week", value: "3", delta: "+1", deltaDir: "up", good: true, spark: [4, 5, 4, 6, 7, 6, 8] },
  { label: "Usage this month", value: "1.24M", delta: "+18%", deltaDir: "up", good: true, spark: [3, 4, 6, 5, 7, 8, 9] },
  { label: "API keys", value: "5", delta: "+2", deltaDir: "up", good: true, spark: [1, 1, 2, 3, 3, 4, 5] },
  { label: "Errors (24h)", value: "12", delta: "-38%", deltaDir: "down", good: true, spark: [9, 8, 7, 6, 5, 4, 3] },
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

/* ============================ Usage / analytics ============================ */

export const memberActivitySeries: number[] = [
  8, 11, 9, 13, 12, 16, 14, 18, 15, 19, 22, 20, 24, 21, 26, 23, 28, 25, 30, 27, 32, 29,
];

export interface TopProject {
  name: string;
  slug: string;
  requests: number;
  pct: number;
}

export const topProjects: TopProject[] = [
  { name: "Payments API", slug: "payments-api", requests: 521000, pct: 100 },
  { name: "Web Dashboard", slug: "web-dashboard", requests: 334000, pct: 64 },
  { name: "Data Pipeline", slug: "data-pipeline", requests: 223000, pct: 43 },
  { name: "Internal Tools", slug: "internal-tools", requests: 111000, pct: 21 },
  { name: "Sandbox", slug: "sandbox", requests: 49000, pct: 9 },
];

/* ============================ Billing ============================ */

export interface Plan {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  current: boolean;
  cta: string;
}

export interface UsageLimit {
  label: string;
  used: number;
  limit: number;
  unit: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "open";
}

export const currentPlan = { name: "Team", price: "$99", cadence: "per month", renewal: "Aug 1, 2026" };

export const usageLimits: UsageLimit[] = [
  { label: "API requests", used: 1_240_000, limit: 2_000_000, unit: "" },
  { label: "Projects", used: 6, limit: 25, unit: "" },
  { label: "Members", used: 3, limit: 15, unit: "" },
  { label: "Storage", used: 42, limit: 100, unit: "GB" },
];

export const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "/mo",
    features: ["Up to 3 projects", "2 members", "100K requests / mo", "Community support"],
    current: false,
    cta: "Downgrade",
  },
  {
    name: "Team",
    price: "$99",
    cadence: "/mo",
    features: ["Up to 25 projects", "15 members", "2M requests / mo", "Audit log", "Priority support"],
    current: true,
    cta: "Current plan",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    features: ["Unlimited projects", "SSO / SAML & SCIM", "Unlimited requests", "SLA + dedicated support"],
    current: false,
    cta: "Contact sales",
  },
];

export const invoices: Invoice[] = [
  { id: "INV-2026-07", date: "Jul 1, 2026", amount: "$99.00", status: "open" },
  { id: "INV-2026-06", date: "Jun 1, 2026", amount: "$99.00", status: "paid" },
  { id: "INV-2026-05", date: "May 1, 2026", amount: "$99.00", status: "paid" },
  { id: "INV-2026-04", date: "Apr 1, 2026", amount: "$99.00", status: "paid" },
];

export const paymentMethod = { brand: "Visa", last4: "4242", exp: "08 / 28" };
export const creditBalance = { credits: 12_400, total: 20_000 };

/* ============================ Settings ============================ */

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string;
  status: "active" | "disabled";
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const apiKeys: ApiKey[] = [
  { id: "k1", name: "Production", prefix: "acme_live_4f2a…9c1", created: "Jul 6, 2026", lastUsed: "3h ago" },
  { id: "k2", name: "CI / CD", prefix: "acme_live_1b8e…7d2", created: "Jun 20, 2026", lastUsed: "1d ago" },
  { id: "k3", name: "Local dev", prefix: "acme_test_9a0c…3f4", created: "Jun 2, 2026", lastUsed: "5d ago" },
];

export const webhooks: Webhook[] = [
  { id: "w1", url: "https://api.acme.com/hooks/airlock", events: "project.*, member.*", status: "active" },
  { id: "w2", url: "https://ops.acme.com/audit", events: "audit.*", status: "active" },
  { id: "w3", url: "https://staging.acme.com/hooks", events: "project.create", status: "disabled" },
];

export const sessions: Session[] = [
  { id: "s1", device: "Chrome · macOS", location: "San Francisco, US", lastActive: "now", current: true },
  { id: "s2", device: "Safari · iPhone", location: "San Francisco, US", lastActive: "2h ago", current: false },
  { id: "s3", device: "Firefox · Windows", location: "Austin, US", lastActive: "3d ago", current: false },
];
