import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { COMPETITIONS, isCompetitionId, paperPhase } from "@/lib/registrations/config";
import type { PaperSubmissionRow } from "@/lib/admin/types";
import { PaperForm } from "@/components/registration/paper-form";

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  // Everything here depends on the session, so the whole body sits behind the
  // boundary and the route can still prerender its shell.
  return (
    <Suspense fallback={<PaperSkeleton />}>
      <PaperBody params={params} />
    </Suspense>
  );
}

function PaperSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-6">
      <div className="h-4 w-40 rounded bg-white/10" />
      <div className="h-8 w-56 rounded-lg bg-white/10" />
      <div className="h-96 rounded-2xl border border-white/10 bg-white/[0.03]" />
    </div>
  );
}

async function PaperBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // RLS scopes this to the caller's own team; anything else reads back null.
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, team_name, competition")
    .eq("id", id)
    .maybeSingle();
  if (!reg || !isCompetitionId(reg.competition)) redirect("/protected");

  const cfg = COMPETITIONS[reg.competition];
  const phase = paperPhase(reg.competition);
  // A competition with no paper round, or one whose window isn't open, has no
  // form to show — the dashboard explains the state.
  if (phase !== "open") redirect("/protected");

  // Absent until the Step 21 migration runs; treated as "nothing submitted yet".
  const { data: paper } = await supabase
    .from("paper_submissions")
    .select("*")
    .eq("registration_id", id)
    .maybeSingle();
  const existing = paper as PaperSubmissionRow | null;

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
          {existing ? "Replace your paper" : "Submit your full paper"}
        </h1>
        <p className="mt-1.5 text-sm text-white/55">
          {cfg.paperSubmission?.video
            ? "Attach your full paper and video for "
            : "Attach your full paper for "}
          <span className="font-medium text-white/80">{reg.team_name}</span>. No fee for
          this round.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="relative h-12 w-12 shrink-0">
            <Image src={cfg.logo} alt={`${cfg.name} logo`} fill sizes="48px" className="object-contain" />
          </div>
          <div>
            <p className="font-semibold text-white">{reg.team_name}</p>
            <p className="text-sm text-white/55">{cfg.name}</p>
          </div>
        </div>

        <PaperForm
          registrationId={reg.id}
          video={cfg.paperSubmission?.video ?? false}
          existing={
            existing ? { paperUrl: existing.paper_url, videoUrl: existing.video_url } : null
          }
        />
      </div>
    </section>
  );
}
