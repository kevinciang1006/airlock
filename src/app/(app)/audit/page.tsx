import { resolveActiveOrg } from "@/lib/queries";
import { AuditView } from "@/components/audit/audit-view";

export default async function AuditPage() {
  const activeOrg = await resolveActiveOrg();
  if (!activeOrg) return null;
  return <AuditView orgSlug={activeOrg.slug} />;
}
