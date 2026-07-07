"use client";

import * as React from "react";
import { Building2, User, Shield, KeyRound, Webhook, Bell, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/primitives/avatar";
import { CopyButton } from "@/components/primitives/copy-button";
import { toast } from "@/components/toast/use-toast";
import { apiKeys, webhooks, sessions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Section = "org" | "profile" | "security" | "apikeys" | "webhooks" | "notifications" | "sso";

const NAV: Array<{ key: Section; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "org", label: "Organization", icon: Building2 },
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "apikeys", label: "API keys", icon: KeyRound },
  { key: "webhooks", label: "Webhooks", icon: Webhook },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "sso", label: "Enterprise SSO", icon: Network },
];

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-[18px]">
      <div className="text-[15px] font-semibold text-ink">{title}</div>
      {desc && <div className="mt-0.5 text-[13px] text-muted">{desc}</div>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex max-w-[440px] flex-col gap-1.5 text-[13px] font-medium text-label">
      {label}
      {children}
    </label>
  );
}

export function SettingsView({
  orgName,
  orgSlug,
  userName,
  userEmail,
}: {
  orgName: string;
  orgSlug: string;
  userName: string;
  userEmail: string;
}) {
  const [section, setSection] = React.useState<Section>("org");
  const saved = () => toast({ title: "Changes saved", variant: "success" });

  return (
    <div className="animate-reveal">
      <div className="mb-5">
        <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Settings</h1>
        <p className="mt-1 text-muted">Manage your organization and account.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]" data-settings>
        {/* Section nav */}
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" data-settings-nav>
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                onClick={() => setSection(n.key)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium",
                  section === n.key ? "bg-accent-tint text-accent-tint-fg" : "text-mid hover:bg-wash-hover",
                )}
              >
                <Icon className={cn("h-[17px] w-[17px]", section === n.key && "text-accent")} />
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {section === "org" && (
            <>
              <Card title="Organization" desc="Your organization's identity and defaults.">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar name={orgSlug} variant="solid" size={48} />
                  <Button variant="secondary" size="sm">
                    Change logo
                  </Button>
                </div>
                <div className="flex flex-col gap-3.5">
                  <Labelled label="Name">
                    <Input defaultValue={orgName} />
                  </Labelled>
                  <Labelled label="Slug">
                    <Input defaultValue={orgSlug} className="font-mono" />
                  </Labelled>
                </div>
                <Button className="mt-4" onClick={saved}>
                  Save changes
                </Button>
              </Card>
              <div className="rounded-lg border border-danger-border bg-surface p-[18px]">
                <div className="text-[15px] font-semibold text-danger">Delete organization</div>
                <div className="mb-4 mt-1 text-[13px] text-muted">
                  Permanently delete <span className="font-mono">{orgSlug}</span> and all its data. This cannot be
                  undone.
                </div>
                <Button variant="danger" onClick={() => toast({ title: "Deletion is disabled in the demo", variant: "info" })}>
                  Delete organization
                </Button>
              </div>
            </>
          )}

          {section === "profile" && (
            <Card title="Profile" desc="How you appear across Airlock.">
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={userName || userEmail} size={48} />
                <Button variant="secondary" size="sm">
                  Upload photo
                </Button>
              </div>
              <div className="flex flex-col gap-3.5">
                <Labelled label="Full name">
                  <Input defaultValue={userName} placeholder="Your name" />
                </Labelled>
                <Labelled label="Email">
                  <Input defaultValue={userEmail} className="font-mono" />
                </Labelled>
              </div>
              <Button className="mt-4" onClick={saved}>
                Save changes
              </Button>
            </Card>
          )}

          {section === "security" && (
            <>
              <Card title="Two-factor authentication" desc="Add a second step when signing in.">
                <div className="flex items-center justify-between rounded-md border border-line bg-wash-hover px-3.5 py-3">
                  <div>
                    <div className="text-[13.5px] font-medium text-ink">Authenticator app</div>
                    <div className="text-[12px] text-muted">Not configured</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => toast({ title: "2FA setup (demo)", variant: "info" })}>
                    Enable
                  </Button>
                </div>
              </Card>
              <Card title="Active sessions" desc="Devices currently signed in to your account.">
                <div className="flex flex-col">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border-b border-wash-track py-3 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
                          {s.device}
                          {s.current && (
                            <span className="rounded-full bg-ok-tint px-2 py-0.5 text-[11px] font-semibold text-ok">
                              This device
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[12px] text-faint">
                          {s.location} · {s.lastActive}
                        </div>
                      </div>
                      {!s.current && (
                        <button
                          onClick={() => toast({ title: "Session revoked", variant: "success" })}
                          className="text-[12.5px] text-danger hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="mt-4" onClick={() => toast({ title: "Signed out other sessions", variant: "success" })}>
                  Sign out all other sessions
                </Button>
              </Card>
            </>
          )}

          {section === "apikeys" && (
            <Card title="API keys" desc="Keys authenticate programmatic access. Keep them secret.">
              <div className="mb-3 flex justify-end">
                <Button size="sm" onClick={() => toast({ title: "API key generated", description: "Copy it now — it won't be shown again.", variant: "success" })}>
                  Generate key
                </Button>
              </div>
              <div className="overflow-hidden rounded-md border border-line">
                <table className="w-full border-collapse">
                  <tbody>
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="border-b border-wash-track last:border-0">
                        <td className="px-3.5 py-3">
                          <div className="text-[13.5px] font-medium text-ink">{k.name}</div>
                          <div className="text-[11.5px] text-muted">
                            Created {k.created} · last used {k.lastUsed}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[12.5px] text-mid">{k.prefix}</span>
                            <CopyButton value={k.prefix} />
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            onClick={() => toast({ title: "Key revoked", variant: "success" })}
                            className="text-[12.5px] text-danger hover:underline"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {section === "webhooks" && (
            <Card title="Webhooks" desc="Send event notifications to your endpoints.">
              <div className="mb-3 flex justify-end">
                <Button size="sm" onClick={() => toast({ title: "Add endpoint (demo)", variant: "info" })}>
                  Add endpoint
                </Button>
              </div>
              <div className="flex flex-col gap-2.5">
                {webhooks.map((w) => (
                  <div key={w.id} className="rounded-md border border-line px-3.5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[13px] text-ink">{w.url}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          w.status === "active" ? "bg-ok-tint text-ok" : "bg-wash-track text-mid",
                        )}
                      >
                        {w.status === "active" ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11.5px] text-muted">{w.events}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === "notifications" && (
            <Card title="Notifications" desc="Choose what we email you about.">
              <div className="flex flex-col">
                {[
                  ["Project activity", true],
                  ["New members", true],
                  ["Usage & limits", true],
                  ["Billing & invoices", true],
                  ["Product updates", false],
                ].map(([label, on]) => (
                  <label
                    key={label as string}
                    className="flex items-center justify-between border-b border-wash-track py-3 last:border-0"
                  >
                    <span className="text-[13.5px] text-label">{label}</span>
                    <input type="checkbox" defaultChecked={on as boolean} className="h-[16px] w-[16px] accent-accent" />
                  </label>
                ))}
              </div>
              <Button className="mt-4" onClick={saved}>
                Save preferences
              </Button>
            </Card>
          )}

          {section === "sso" && (
            <Card title="Enterprise SSO" desc="SAML & SCIM for centralized identity management.">
              <div className="rounded-md border border-dashed border-line-strong2 bg-wash-hover px-4 py-8 text-center">
                <Network className="mx-auto h-7 w-7 text-faint" />
                <div className="mt-3 text-[14px] font-semibold text-ink">SSO is available on Enterprise</div>
                <div className="mx-auto mt-1 max-w-[320px] text-[13px] text-muted">
                  Configure SAML sign-in and SCIM provisioning for your identity provider.
                </div>
                <Button className="mt-4" onClick={() => toast({ title: "Contact sales to enable SSO", variant: "info" })}>
                  Configure SSO
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
