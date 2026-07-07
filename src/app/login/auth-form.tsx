"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { authAction, signInWithGoogle, type AuthState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup" | "forgot";

const COPY: Record<Mode, { title: string; sub: string; cta: string }> = {
  signin: { title: "Welcome back", sub: "Sign in to your Airlock workspace.", cta: "Sign in" },
  signup: { title: "Create your account", sub: "Spin up an isolated tenant in minutes.", cta: "Create account" },
  forgot: { title: "Reset your password", sub: "We'll email you a secure reset link.", cta: "Send reset link" },
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
      {pending ? "Working…" : label}
    </Button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
      {label}
      {children}
    </label>
  );
}

export function AuthForm() {
  const [mode, setMode] = React.useState<Mode>("signin");
  const [state, formAction] = useFormState<AuthState, FormData>(authAction, undefined);
  const copy = COPY[mode];

  return (
    <div>
      <h1 className="font-display text-[26px] font-semibold tracking-[-.02em] text-ink">{copy.title}</h1>
      <p className="mb-6 mt-1.5 text-muted">{copy.sub}</p>

      <form action={formAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="mode" value={mode} />
        {mode === "signup" && (
          <Field label="Full name">
            <Input name="name" placeholder="Ada Lovelace" autoComplete="name" />
          </Field>
        )}
        <Field label="Email">
          <Input
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            defaultValue="owner@acme.test"
            required
          />
        </Field>
        {mode !== "forgot" && (
          <Field label="Password">
            <Input
              name="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              defaultValue="Password123!"
              required
            />
          </Field>
        )}

        {state?.error ? <p className="text-[13px] text-danger">{state.error}</p> : null}
        {state?.message ? <p className="text-[13px] text-ok">{state.message}</p> : null}

        <SubmitButton label={copy.cta} />
      </form>

      {mode !== "forgot" && (
        <>
          <div className="my-5 flex items-center gap-3 text-[12px] text-faint">
            <div className="h-px flex-1 bg-line" />
            OR
            <div className="h-px flex-1 bg-line" />
          </div>
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-line bg-surface font-medium text-label hover:bg-wash-hover"
            >
              <span className="font-display font-bold text-[#4285F4]">G</span> Continue with Google
            </button>
          </form>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-[13px] text-muted">
        {mode !== "signin" && (
          <button type="button" onClick={() => setMode("signin")} className="hover:text-accent">
            Sign in
          </button>
        )}
        {mode !== "signup" && (
          <button type="button" onClick={() => setMode("signup")} className="hover:text-accent">
            Create account
          </button>
        )}
        {mode !== "forgot" && (
          <button type="button" onClick={() => setMode("forgot")} className="hover:text-accent">
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
