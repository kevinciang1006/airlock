import Link from "next/link";
import { Avatar } from "@/components/primitives/avatar";
import { activity } from "@/lib/mock-data";

export function ActivityFeed() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-[18px] py-4">
        <span className="text-[15px] font-semibold text-ink">Recent activity</span>
        <Link href="/audit" className="text-[12.5px] text-accent hover:text-accent-hover">
          View audit log →
        </Link>
      </div>
      {activity.map((a) => (
        <div key={a.id} className="flex items-center gap-3 border-b border-wash-track px-[18px] py-3 last:border-0">
          <Avatar name={a.actor} size={30} />
          <div className="min-w-0 flex-1 text-[13.5px]">
            <span className="font-medium text-ink">{a.actor}</span>{" "}
            <span className="text-muted">{a.action}</span>{" "}
            <span className="font-mono text-[12.5px] text-accent">{a.target}</span>
          </div>
          <span className="flex-shrink-0 font-mono text-[11px] text-faint">{a.time}</span>
        </div>
      ))}
    </div>
  );
}
