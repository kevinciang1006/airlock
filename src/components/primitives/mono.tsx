import { cn } from "@/lib/utils";

/** Identifiers (slugs, IDs, timestamps, keys) rendered in IBM Plex Mono. */
export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-faint", className)}>{children}</span>;
}
