"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";
import { URL_RE } from "@/lib/registrations/validate";
import { COMPETITIONS, currentFee, isCompetitionId, paperPhase } from "@/lib/registrations/config";

export type AddSubmissionResult = { ok: true } | { ok: false; error: string };

// Attaches another paid submission (Entry 2+) to an existing team. The RPC
// (secret key, SECURITY DEFINER) re-checks that the caller owns the registration.
export async function addSubmission(
  registrationId: string,
  paymentProofUrl: string,
  submissionUrl: string,
): Promise<AddSubmissionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be logged in." };

  const hdrs = await headers();
  const allowed = await checkRateLimit(`resubmit:${user.id}:${clientIp(hdrs)}`, 5, 3600);
  if (!allowed)
    return { ok: false, error: "Too many attempts. Please wait a while and try again." };

  const payment = stripHtml(paymentProofUrl);
  const submission = stripHtml(submissionUrl);
  if (!URL_RE.test(payment)) return { ok: false, error: "Payment proof must be a valid link." };
  if (!URL_RE.test(submission)) return { ok: false, error: "Submission must be a valid link." };

  // Same deadline gate as the initial registration. The lookup goes through the
  // RLS-scoped client, so a foreign registration id reads back null here — the
  // RPC re-checks ownership anyway, this just fails it earlier and cheaper.
  const { data: reg } = await supabase
    .from("registrations")
    .select("competition")
    .eq("id", registrationId)
    .maybeSingle();
  if (!reg) return { ok: false, error: "You can only submit for your own team." };
  if (!isCompetitionId(reg.competition) || !currentFee(reg.competition))
    return { ok: false, error: "Submissions for this competition have closed." };

  const admin = createAdminClient();
  const { error } = await admin.rpc("add_submission", {
    p_user_id: user.id,
    p_registration_id: registrationId,
    p_payment_proof_url: payment,
    p_submission_url: submission,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("not_registration_owner") || msg.includes("registration_not_found"))
      return { ok: false, error: "You can only submit for your own team." };
    console.error("add_submission failed:", error);
    return { ok: false, error: "Submission failed. Please try again." };
  }

  revalidatePath("/protected");
  return { ok: true };
}

export type SubmitPaperResult = { ok: true } | { ok: false; error: string };

// The paper round (Healthineer: paper + video, Healthynovation: paper). Free,
// so unlike `addSubmission` this is gated on the paper window rather than on a
// fee tier — `currentFee` has already lapsed by the time papers are due.
export async function submitPaper(
  registrationId: string,
  paperUrl: string,
  videoUrl: string,
): Promise<SubmitPaperResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be logged in." };

  const hdrs = await headers();
  const allowed = await checkRateLimit(`paper:${user.id}:${clientIp(hdrs)}`, 10, 3600);
  if (!allowed)
    return { ok: false, error: "Too many attempts. Please wait a while and try again." };

  // RLS-scoped: a foreign registration id reads back null. The RPC re-checks
  // ownership anyway; this fails it earlier and cheaper.
  const { data: reg } = await supabase
    .from("registrations")
    .select("competition")
    .eq("id", registrationId)
    .maybeSingle();
  if (!reg) return { ok: false, error: "You can only submit for your own team." };
  if (!isCompetitionId(reg.competition))
    return { ok: false, error: "Unknown competition." };

  const cfg = COMPETITIONS[reg.competition];
  const phase = paperPhase(reg.competition);
  if (phase === "none")
    return { ok: false, error: `${cfg.name} has no paper submission.` };
  if (phase === "before")
    return { ok: false, error: "Paper submission has not opened yet." };
  if (phase === "closed")
    return { ok: false, error: "Paper submission has closed." };

  const paper = stripHtml(paperUrl);
  if (!URL_RE.test(paper)) return { ok: false, error: "Paper must be a valid link." };

  // Video is required for competitions that collect one, and rejected outright
  // for those that don't — a stray link would otherwise sit unreviewed in the DB.
  let video: string | null = null;
  if (cfg.paperSubmission?.video) {
    video = stripHtml(videoUrl);
    if (!URL_RE.test(video)) return { ok: false, error: "Video must be a valid link." };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("upsert_paper_submission", {
    p_user_id: user.id,
    p_registration_id: registrationId,
    p_paper_url: paper,
    p_video_url: video,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("not_registration_owner") || msg.includes("registration_not_found"))
      return { ok: false, error: "You can only submit for your own team." };
    // Step 21 migration not run yet.
    if (error.code === "42883" || msg.includes("upsert_paper_submission"))
      return { ok: false, error: "Paper submission isn't available yet. Please try again later." };
    console.error("upsert_paper_submission failed:", error);
    return { ok: false, error: "Submission failed. Please try again." };
  }

  revalidatePath("/protected");
  return { ok: true };
}
