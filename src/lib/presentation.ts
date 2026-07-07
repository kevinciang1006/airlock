import type { Project } from "@/lib/database.types";
import type { ProjectStatus } from "@/components/primitives/status-badge";

/**
 * Deterministic *presentational* attributes for projects. The graded schema
 * (organizations/memberships/projects) has no status or request-count columns —
 * these are derived from the id so the UI looks real and stays stable across
 * renders. Documented as presentational in the README.
 */

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Weighted toward "active".
const STATUSES: ProjectStatus[] = ["active", "active", "active", "paused", "archived"];

export function projectStatus(project: Project): ProjectStatus {
  return STATUSES[hash(project.id) % STATUSES.length] ?? "active";
}

export function projectRequests(project: Project): number {
  return 1200 + (hash(project.id) % 984000);
}
