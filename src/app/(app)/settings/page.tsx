import { getSessionUser, resolveActiveOrg } from "@/lib/queries";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const [user, activeOrg] = await Promise.all([getSessionUser(), resolveActiveOrg()]);
  if (!activeOrg) return null;

  const meta = user?.user_metadata as { full_name?: unknown } | undefined;
  const userName = typeof meta?.full_name === "string" ? meta.full_name : "";

  return (
    <SettingsView
      orgName={activeOrg.name}
      orgSlug={activeOrg.slug}
      userName={userName}
      userEmail={user?.email ?? ""}
    />
  );
}
