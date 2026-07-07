import { notFound } from "next/navigation";
import { resolveActiveOrg, getProject, getMembers } from "@/lib/queries";
import { projectStatus, projectRequests } from "@/lib/presentation";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return null;

  // RLS scopes visibility — a project in another tenant returns null → 404.
  const project = await getProject(params.id);
  if (!project) notFound();

  const members = await getMembers(activeOrg.id);
  const ownerName = members.find((m) => m.userId === project.created_by)?.name ?? "Unknown";

  return (
    <ProjectDetail
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.created_at,
      }}
      ownerName={ownerName}
      status={projectStatus(project)}
      requests={projectRequests(project)}
      members={members.map((m) => ({ userId: m.userId, name: m.name, email: m.email, role: m.role }))}
      orgSlug={activeOrg.slug}
      canDelete={activeOrg.role !== "member"}
    />
  );
}
