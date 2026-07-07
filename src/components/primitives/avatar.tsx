import { initials, avatarTint, avatarColor } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Initials avatar. `solid` = white-on-color (orgs); `tint` = color-on-tint (people). */
export function Avatar({
  name,
  size = 30,
  variant = "tint",
  className,
}: {
  name: string;
  size?: number;
  variant?: "solid" | "tint";
  className?: string;
}) {
  const label = initials(name);
  const radius = size <= 28 ? 7 : size <= 36 ? 8 : 12;
  const base = "flex flex-shrink-0 items-center justify-center font-display font-semibold";

  if (variant === "solid") {
    return (
      <div
        className={cn(base, "text-white", className)}
        style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.38, borderRadius: radius }}
      >
        {label}
      </div>
    );
  }
  const { bg, fg } = avatarTint(name);
  return (
    <div
      className={cn(base, className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38, borderRadius: radius }}
    >
      {label}
    </div>
  );
}
