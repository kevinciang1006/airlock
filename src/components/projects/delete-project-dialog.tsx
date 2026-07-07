"use client";

import * as React from "react";
import { deleteProject } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/toast/use-toast";

export function DeleteProjectDialog({
  project,
  orgSlug,
  onDone,
  onDeleted,
}: {
  project: { id: string; name: string } | null;
  orgSlug: string;
  onDone: () => void;
  onDeleted?: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);

  async function confirm() {
    if (!project) return;
    setDeleting(true);
    const res = await deleteProject(project.id);
    setDeleting(false);
    if (res?.error) {
      toast({ title: "Could not delete", description: res.error, variant: "error" });
    } else {
      toast({ title: "Project deleted", variant: "success" });
      onDeleted?.();
    }
    onDone();
  }

  return (
    <Dialog open={project !== null} onOpenChange={(o) => !o && onDone()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This permanently removes <span className="font-semibold text-ink">{project?.name}</span> and its data
            in <span className="font-mono">{orgSlug}</span>. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
          <Button variant="danger-solid" disabled={deleting} onClick={confirm}>
            {deleting ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
