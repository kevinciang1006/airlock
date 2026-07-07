"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "error" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type ToastInput = Omit<Toast, "id" | "variant"> & { variant?: ToastVariant };

const TOAST_DURATION = 4000;

let toasts: Toast[] = [];
const listeners = new Set<(t: Toast[]) => void>();

function emit() {
  for (const l of listeners) l([...toasts]);
}

/** Fire a toast from anywhere (client components). */
export function toast(input: ToastInput): string {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, variant: "default", ...input }];
  emit();
  if (typeof window !== "undefined") {
    window.setTimeout(() => dismissToast(id), TOAST_DURATION);
  }
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** Subscribe a component to the current toast list. */
export function useToast(): { toasts: Toast[] } {
  const [state, setState] = React.useState<Toast[]>(toasts);
  React.useEffect(() => {
    listeners.add(setState);
    setState([...toasts]);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return { toasts: state };
}
