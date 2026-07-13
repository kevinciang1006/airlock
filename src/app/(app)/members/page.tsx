import { resolveActiveOrg, getMembers } from "@/lib/queries";
import { MembersView, type MemberDisplay } from "@/components/members/members-view";

export default async function MembersPage() {
  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return null;

  const members = await getMembers(activeOrg.id);
  const display: MemberDisplay[] = members.map((m) => ({
    userId: m.userId,
    name: m.name,
    email: m.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return (
    <MembersView
      members={display}
      orgName={activeOrg.name}
      canInvite={activeOrg.role !== "member"}
      currentRole={activeOrg.role}
    />
  );
}
