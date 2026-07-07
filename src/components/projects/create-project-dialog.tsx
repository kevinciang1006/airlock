"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProject, type AuthState } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/toast/use-toast";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create project"}
    </Button>
  );
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, action] = useFormState<AuthState, FormData>(createProject, undefined);

  React.useEffect(() => {
    if (state?.message === "Created") {
      toast({ title: "Project created", variant: "success" });
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Add a project to this organization.</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
            Name
            <Input name="name" placeholder="Payments API" required autoFocus />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
            Description <span className="font-normal text-faint">(optional)</span>
            <textarea
              name="description"
              placeholder="What is this project for?"
              rows={3}
              className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            />
          </label>
          {state?.error ? <p className="text-[13px] text-danger">{state.error}</p> : null}
          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Submit />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
