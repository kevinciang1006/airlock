"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast, dismissToast, type ToastVariant } from "./use-toast";

const ICONS: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_COLOR: Record<ToastVariant, string> = {
  default: "text-muted",
  success: "text-ok",
  error: "text-danger",
  info: "text-info",
};

export function Toaster() {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[340px] max-w-[calc(100vw-32px)] flex-col gap-2.5">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex animate-toastin items-start gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-dropdown"
          >
            <Icon className={cn("mt-0.5 h-[18px] w-[18px] flex-shrink-0", ICON_COLOR[t.variant])} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-ink">{t.title}</div>
              {t.description ? <div className="mt-0.5 text-[12.5px] text-muted">{t.description}</div> : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm text-faint hover:bg-wash-hover"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
