"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";
import { URL_RE } from "@/lib/registrations/validate";

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
