import { TopProgress, OverviewSkeleton } from "@/components/skeletons";

// Fallback for the overview route (and any child route without its own).
export default function Loading() {
  return (
    <>
      <TopProgress />
      <OverviewSkeleton />
    </>
  );
}
