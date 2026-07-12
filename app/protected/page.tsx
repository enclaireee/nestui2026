import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Inner component that performs the dynamic authentication check and content rendering.
 * It accesses cookies, so it is deferred via Suspense to run at request time.
 */
async function DashboardContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // Redirect to login if unauthenticated
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <section className="flex flex-col gap-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">
          {data.user.email}
        </span>
        . This page is only visible to authenticated users.
      </p>
    </section>
  );
}

/**
 * Main page component wrapped in Suspense to satisfy Next.js static prerender checks.
 */
export default function ProtectedPage() {
  return (
    <Suspense fallback={<div className="py-12 text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
