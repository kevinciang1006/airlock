import { cn } from "@/lib/utils";

/** The Airlock mark (amber "A" square) + optional wordmark. */
export function Logo({
  size = 32,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-[9px] bg-accent font-display font-bold text-white"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        A
      </div>
      {withWordmark && (
        <span className="font-display text-[19px] font-bold tracking-[-.02em] text-ink">Airlock</span>
      )}
    </div>
  );
}
