/** Formatting + deterministic presentation helpers used across the UI. */

/** Up to two uppercase initials from a name or email. */
export function initials(input: string): string {
  const name = input.includes("@") ? (input.split("@")[0] ?? input) : input;
  const parts = name
    .split(/[\s._-]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Stable hash for deterministic color assignment. */
function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Solid avatar backgrounds (white text) — org avatars. No purple. */
const SOLID_AVATARS = ["#B25E09", "#1257A0", "#067647", "#10192A", "#0E7490", "#B54708"] as const;

export function avatarColor(seed: string): string {
  return SOLID_AVATARS[hash(seed) % SOLID_AVATARS.length] ?? "#B25E09";
}

/** Tinted {bg, fg} avatar pairs — member/user avatars. No purple. */
const TINT_AVATARS: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: "#FBF0E4", fg: "#B25E09" },
  { bg: "#EAF1FB", fg: "#1257A0" },
  { bg: "#E7F4EC", fg: "#067647" },
  { bg: "#F2F4F7", fg: "#475467" },
  { bg: "#FEF3F2", fg: "#B42318" },
];

export function avatarTint(seed: string): { bg: string; fg: string } {
  return TINT_AVATARS[hash(seed) % TINT_AVATARS.length] ?? { bg: "#F2F4F7", fg: "#475467" };
}

/** "1,240" · "1.24M" · "3.4K". */
export function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-US");
}

/** "Jul 6, 2026". */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "just now" · "3h ago" · "2d ago" · falls back to formatDate. */
export function formatRelative(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}
