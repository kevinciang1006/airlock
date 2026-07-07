"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrgForm } from "./create-org-form";

/** Wraps a trigger; opens a modal that creates a new isolated tenant. */
export function CreateOrgDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>Every organization is an isolated tenant with its own data.</DialogDescription>
        </DialogHeader>
        <CreateOrgForm />
      </DialogContent>
    </Dialog>
  );
}
