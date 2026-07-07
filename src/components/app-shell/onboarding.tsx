import { Logo } from "@/components/primitives/logo";
import { CreateOrgForm } from "./create-org-form";

/** Shown when a signed-in user belongs to no organization yet. */
export function Onboarding() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-paper p-8">
      <div className="w-full max-w-[420px] animate-reveal py-8">
        <Logo className="mb-8" />
        <h1 className="font-display text-[26px] font-semibold tracking-[-.02em] text-ink">
          Create your organization
        </h1>
        <p className="mb-6 mt-1.5 text-muted">
          Every workspace in Airlock is an isolated tenant. Name yours to get started.
        </p>
        <CreateOrgForm />
      </div>
    </div>
  );
}
