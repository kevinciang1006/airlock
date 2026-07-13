import { TopProgress, MembersSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <TopProgress />
      <MembersSkeleton />
    </>
  );
}
