import { resolveActiveOrg, getProjects, getMembers } from "@/lib/queries";
import { projectStatus, projectRequests } from "@/lib/presentation";
import { ProjectsView, type ProjectRow } from "@/components/projects/projects-view";

export default async function ProjectsPage() {
  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return null;

  const [projects, members] = await Promise.all([getProjects(activeOrg.id), getMembers(activeOrg.id)]);
  const nameById = new Map(members.map((m) => [m.userId, m.name ?? m.email ?? "Unknown"]));

  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.created_at,
    owner: nameById.get(p.created_by) ?? "Unknown",
    status: projectStatus(p),
    requests: projectRequests(p),
  }));

  // Role-gate the delete UI to match the DB (has_org_role owner/admin). RLS is
  // the real boundary; this is UX only.
  const canDelete = activeOrg.role !== "member";

  return <ProjectsView rows={rows} canDelete={canDelete} orgName={activeOrg.name} orgSlug={activeOrg.slug} />;
}
