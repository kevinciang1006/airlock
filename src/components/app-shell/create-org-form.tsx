"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createOrg, type AuthState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Creating…" : "Create organization"}
    </Button>
  );
}

export function CreateOrgForm() {
  const [state, action] = useFormState<AuthState, FormData>(createOrg, undefined);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugEdited, setSlugEdited] = React.useState(false);

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Organization name
        <Input
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          placeholder="Acme Inc"
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Slug
        <div className="flex items-center rounded-md border border-line bg-surface pl-3 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1">
          <span className="font-mono text-[13px] text-faint">airlock.app/</span>
          <Input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="acme"
            className="border-0 pl-1 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
            required
          />
        </div>
      </label>
      {state?.error ? <p className="text-[13px] text-danger">{state.error}</p> : null}
      <Submit />
    </form>
  );
}
