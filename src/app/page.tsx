import { redirect } from "next/navigation";

// Temporary landing route for the Phase-A build gate.
// Replaced by the auth-guarded dashboard at `(app)/page.tsx` in Phase G.
export default function IndexPage() {
  redirect("/login");
}
