"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, KeyRound } from "lucide-react";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export function QuickActions() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);

  const actions = [
    { icon: Plus, title: "New project", desc: "Spin up a workspace", onClick: () => setCreateOpen(true) },
    { icon: UserPlus, title: "Invite teammate", desc: "Add a member by email", onClick: () => router.push("/members") },
    { icon: KeyRound, title: "Generate API key", desc: "For programmatic access", onClick: () => router.push("/settings") },
  ];

  return (
    <div className="rounded-lg border border-line bg-surface p-[18px]">
      <div className="mb-3.5 text-[15px] font-semibold text-ink">Quick actions</div>
      <div className="flex flex-col gap-2.5">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.title}
              onClick={a.onClick}
              className="flex items-center gap-3 rounded-md border border-line bg-wash-hover px-3.5 py-3 text-left hover:bg-wash-track"
            >
              <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">{a.title}</span>
                <span className="text-[12px] text-muted">{a.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
