"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { ChevronLeft } from "lucide-react";
import { updateProject, type AuthState } from "@/app/actions";
import type { OrgRole } from "@/lib/database.types";
import { Avatar } from "@/components/primitives/avatar";
import { StatusBadge, type ProjectStatus } from "@/components/primitives/status-badge";
import { RoleBadge } from "@/components/primitives/role-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { formatNumber, formatDate } from "@/lib/format";
import { activity } from "@/lib/mock-data";
import { toast } from "@/components/toast/use-toast";
import { cn } from "@/lib/utils";

interface DetailMember {
  userId: string;
  name: string | null;
  email: string | null;
  role: OrgRole;
}

type Tab = "overview" | "activity" | "access" | "settings";
const TABS: Array<{ key: Tab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "activity", label: "Activity" },
  { key: "access", label: "Access" },
  { key: "settings", label: "Settings" },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProjectDetail({
  project,
  ownerName,
  status,
  requests,
  members,
  orgSlug,
  canDelete,
}: {
  project: { id: string; name: string; description: string | null; createdAt: string };
  ownerName: string;
  status: ProjectStatus;
  requests: number;
  members: DetailMember[];
  orgSlug: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [state, formAction] = useFormState<AuthState, FormData>(updateProject, undefined);

  React.useEffect(() => {
    if (state?.message === "Saved") toast({ title: "Changes saved", variant: "success" });
  }, [state]);

  const slug = slugify(project.name);

  return (
    <div className="animate-reveal">
      <button
        onClick={() => router.push("/projects")}
        className="mb-3.5 flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> All projects
      </button>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={project.name} size={48} />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-[23px] font-semibold tracking-[-.02em] text-ink">{project.name}</h1>
              <StatusBadge status={status} />
            </div>
            <div className="mt-0.5 font-mono text-[12.5px] text-faint">{slug}</div>
          </div>
        </div>
        <Button variant="secondary">Open dashboard</Button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-0.5 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-3.5 py-2.5 text-[13.5px] font-medium",
              tab === t.key ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {[
              { label: "Requests (30d)", value: formatNumber(requests) },
              { label: "Members with access", value: String(members.length) },
              { label: "Created", value: formatDate(project.createdAt) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-line bg-surface p-4">
                <div className="text-[12.5px] text-muted">{s.label}</div>
                <div className="mt-1.5 font-display text-[24px] font-semibold text-ink">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-surface p-[18px]">
            <div className="mb-4 text-[15px] font-semibold text-ink">Metadata</div>
            {[
              { k: "Project ID", v: project.id },
              { k: "Slug", v: slug },
              { k: "Owner", v: ownerName },
              { k: "Description", v: project.description ?? "—" },
              { k: "Created", v: formatDate(project.createdAt) },
            ].map((m) => (
              <div
                key={m.k}
                className="flex items-center justify-between border-b border-wash-track py-2.5 last:border-0"
              >
                <span className="text-[13px] text-muted">{m.k}</span>
                <span className="max-w-[60%] truncate font-mono text-[12.5px] text-label">{m.v}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "activity" && (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          {activity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 border-b border-wash-track px-[18px] py-3 last:border-0">
              <Avatar name={a.actor} size={30} />
              <div className="flex-1 text-[13.5px]">
                <span className="font-medium text-ink">{a.actor}</span>{" "}
                <span className="text-muted">{a.action}</span>{" "}
                <span className="font-mono text-[12.5px] text-accent">{a.target}</span>
              </div>
              <span className="font-mono text-[11px] text-faint">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "access" && (
        <div className="rounded-lg border border-line bg-surface p-[18px]">
          <div className="text-[15px] font-semibold text-ink">Who can access this project</div>
          <div className="mb-4 mt-1 text-[13px] text-muted">Members inherit org roles unless overridden here.</div>
          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 border-b border-wash-track py-2.5 last:border-0">
              <Avatar name={m.name ?? m.email ?? m.userId} size={30} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-ink">{m.name ?? "Member"}</div>
                <div className="truncate font-mono text-[11px] text-faint">{m.email ?? m.userId}</div>
              </div>
              <RoleBadge role={m.role} />
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div className="flex flex-col gap-4">
          <form action={formAction} className="rounded-lg border border-line bg-surface p-[18px]">
            <div className="mb-4 text-[15px] font-semibold text-ink">Project settings</div>
            <input type="hidden" name="id" value={project.id} />
            <label className="mb-3.5 flex max-w-[440px] flex-col gap-1.5 text-[13px] font-medium text-label">
              Display name
              <Input name="name" defaultValue={project.name} required />
            </label>
            <label className="flex max-w-[440px] flex-col gap-1.5 text-[13px] font-medium text-label">
              Description
              <Input name="description" defaultValue={project.description ?? ""} />
            </label>
            {state?.error ? <p className="mt-2 text-[13px] text-danger">{state.error}</p> : null}
            <div className="mt-4">
              <SaveButton />
            </div>
          </form>

          <div className="rounded-lg border border-danger-border bg-surface p-[18px]">
            <div className="text-[15px] font-semibold text-danger">Danger zone</div>
            <div className="mb-4 mt-1 text-[13px] text-muted">
              Deleting a project is permanent and removes all its data in{" "}
              <span className="font-mono">{orgSlug}</span>.
            </div>
            <Button variant="danger" disabled={!canDelete} onClick={() => setDeleteOpen(true)}>
              Delete project
            </Button>
            {!canDelete && (
              <p className="mt-2 text-[12px] text-faint">Only owners and admins can delete projects.</p>
            )}
          </div>
        </div>
      )}

      <DeleteProjectDialog
        project={deleteOpen ? { id: project.id, name: project.name } : null}
        orgSlug={orgSlug}
        onDone={() => setDeleteOpen(false)}
        onDeleted={() => router.push("/projects")}
      />
    </div>
  );
}
