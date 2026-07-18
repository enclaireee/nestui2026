import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { COMPETITIONS, currentFee } from "@/lib/registrations/config";
import { ResubmitForm } from "@/components/registration/resubmit-form";

export default async function ResubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // RLS (reg_select_own) scopes this to the caller's own team; unknown/other
  // teams come back null and bounce to the dashboard.
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, team_name, competition")
    .eq("id", id)
    .maybeSingle();
  if (!reg) redirect("/protected");

  const cfg = COMPETITIONS[reg.competition as keyof typeof COMPETITIONS];

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/protected"
        className="flex w-fit items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-brand-lime"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Submit again</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Pay the {cfg?.name ?? "competition"} fee again and attach a new submission for{" "}
          <span className="font-medium text-white/80">{reg.team_name}</span>. It&apos;s reviewed
          separately.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-6">
          {cfg && (
            <div
              className="relative h-12 w-12 shrink-0 rounded-xl p-2 ring-1 ring-white/10"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(var(--brand-teal-mid),0.5), rgba(var(--brand-green),0.9))",
              }}
            >
              <Image src={cfg.logo} alt={`${cfg.name} logo`} fill sizes="48px" className="object-contain p-2" />
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{reg.team_name}</p>
            <p className="text-sm text-white/55">{cfg?.name ?? reg.competition}</p>
          </div>
        </div>

        <ResubmitForm
          registrationId={reg.id}
          fee={cfg ? currentFee(cfg.id) : null}
        />
      </div>
    </section>
  );
}
