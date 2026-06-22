import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <section className="flex flex-col gap-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">
          {data.claims.email}
        </span>
        . This page is only visible to authenticated users.
      </p>
    </section>
  );
}
