import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  COMPETITIONS,
  finalPhase,
  isCompetitionId,
  isFinalistTeam,
} from "@/lib/registrations/config";
import type { PresentationSubmissionRow } from "@/lib/admin/types";
import { PresentationForm } from "@/components/registration/presentation-form";

export default function PresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PresentationSkeleton />}>
      <PresentationBody params={params} />
    </Suspense>
  );
}

function PresentationSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-6">
      <div className="h-4 w-40 rounded bg-white/10" />
      <div className="h-8 w-56 rounded-lg bg-white/10" />
      <div className="h-96 rounded-2xl border border-white/10 bg-white/[0.03]" />
    </div>
  );
}

async function PresentationBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // RLS scopes this to the caller's own team; anything else reads back null.
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, code, team_name, competition, is_finalist")
    .eq("id", id)
    .maybeSingle();

  if (!reg || !isCompetitionId(reg.competition)) redirect("/protected");

  // Only the 11 announced finalist teams may view this page
  if (!isFinalistTeam(reg.code, reg.is_finalist)) redirect("/protected");

  const phase = finalPhase();
  if (phase === "closed") redirect("/protected");

  const cfg = COMPETITIONS[reg.competition];

  // Absent until the Step 24 migration runs; treated as "nothing submitted yet".
  const { data: presentation } = await supabase
    .from("presentation_submissions")
    .select("*")
    .eq("registration_id", id)
    .maybeSingle();
  const existing = presentation as PresentationSubmissionRow | null;

  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/protected"
        className="flex w-fit items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-brand-lime"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {existing ? "Replace your presentation deck" : "Submit your presentation deck"}
        </h1>
        <p className="mt-1.5 text-sm text-white/55">
          Attach your final presentation link (PPT / Google Slides) for{" "}
          <span className="font-medium text-white/80">{reg.team_name}</span> for the Grand Final on 3 October 2026.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="relative h-12 w-12 shrink-0">
            <Image src={cfg.logo} alt={`${cfg.name} logo`} fill sizes="48px" className="object-contain" />
          </div>
          <div>
            <p className="font-semibold text-white">{reg.team_name}</p>
            <p className="text-sm text-white/55">
              {cfg.name} · <span className="font-mono text-brand-lime">{reg.code}</span>
            </p>
          </div>
        </div>

        <PresentationForm
          registrationId={reg.id}
          existing={existing ? { pptUrl: existing.ppt_url } : null}
        />
      </div>
    </section>
  );
}
