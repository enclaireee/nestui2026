"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { COMPETITIONS, currentFee, isCompetitionId } from "@/lib/registrations/config";
import { validateDraft } from "@/lib/registrations/validate";
import { sanitizeDraft } from "@/lib/sanitize";
import type { MemberPayload, RegistrationDraft } from "@/lib/registrations/types";

export type SubmitResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

// Server Action: the ONLY path that writes a registration. Never called by
// writing to Supabase from the client. Re-validates everything server-side,
// rate-limits, then performs the atomic insert via the SECURITY DEFINER RPC
// using the secret key.
export async function submitRegistration(draft: RegistrationDraft): Promise<SubmitResult> {
  // 1. Require a logged-in user (ties the team to auth.uid()).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be logged in to register a team." };

  // 2. Rate limit per user + IP (5 submissions / hour).
  const hdrs = await headers();
  const allowed = await checkRateLimit(`submit:${user.id}:${clientIp(hdrs)}`, 5, 3600);
  if (!allowed)
    return { ok: false, error: "Too many attempts. Please wait a while and try again." };

  // 3. Sanitize free-text, then re-validate the whole draft server-side.
  if (!isCompetitionId(draft?.competition))
    return { ok: false, error: "Invalid competition." };

  // Registration closes when the last fee tier lapses. The UI only hides the
  // price once that happens, so without this the Server Action still accepts
  // submissions after the deadline.
  if (!currentFee(draft.competition))
    return { ok: false, error: "Registration for this competition has closed." };

  const clean = sanitizeDraft(draft);
  const cfg = COMPETITIONS[draft.competition];
  const result = validateDraft(clean, cfg);
  if (!result.ok) return { ok: false, error: result.message ?? "Invalid submission." };

  // 4. Atomic insert via RPC (secret key bypasses RLS; function validates again).
  const admin = createAdminClient();
  const members: MemberPayload[] = clean.members.map((m) => ({
    name: m.name,
    email: m.email,
    phone: m.phone,
    student_id: m.studentId,
    institution: m.institution,
    major: cfg.hasMajor ? m.major || null : null,
    confirmation_url: m.confirmationUrl,
  }));

  const { data, error } = await admin.rpc("submit_registration", {
    p_user_id: user.id,
    p_competition: clean.competition,
    p_team_name: clean.teamName,
    p_team_size: clean.teamSize,
    p_leader_name: clean.leader.name,
    p_leader_email: clean.leader.email,
    p_leader_phone: clean.leader.phone,
    p_leader_student_id: clean.leader.studentId,
    p_leader_institution: clean.leader.institution,
    p_leader_major: cfg.hasMajor ? clean.leader.major : null,
    p_leader_confirmation_url: clean.leader.confirmationUrl,
    p_originality_letter_url: clean.originalityLetterUrl,
    p_payment_proof_url: clean.paymentProofUrl,
    p_submission_url: clean.submissionUrl,
    p_members: members,
  });

  if (error) {
    const msg = error.message ?? "";
    // 23505 = unique_violation (uq_reg_user_competition or leader email uniqueness)
    if (error.code === "23505" || msg.includes("uq_reg_user_competition"))
      return {
        ok: false,
        error: "You have already registered a team for this competition.",
      };
    if (msg.includes("duplicate_email"))
      return { ok: false, error: "Each participant must use a different email." };
    if (msg.includes("member_count_mismatch") || msg.includes("invalid_team_size"))
      return { ok: false, error: "Team size and member count do not match." };
    console.error("submit_registration failed:", error);
    return { ok: false, error: "Submission failed. Please try again." };
  }

  return { ok: true, code: data as string };
}
