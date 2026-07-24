"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE } from "@/lib/admin/session";

// NOTE: team deletion was deliberately removed. There is intentionally no
// server action that deletes a registration — a registration is participant
// data and must not be destroyable from the panel. (Do not re-add one without
// an explicit, audited reason.) Registrations are removed only directly in the
// database if ever truly necessary.

export async function adminLogout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const STATUSES = ["pending", "verified", "rejected"] as const;
type Status = (typeof STATUSES)[number];

export async function setRegistrationStatus(id: string, status: string): Promise<void> {
  // Guard: this Server Action must not be usable without an admin session.
  if (!(await isAdminAuthed())) redirect("/admin/login");
  if (!STATUSES.includes(status as Status)) return;

  const admin = createAdminClient();
  const { error } = await admin.rpc("set_registration_status", {
    p_id: id,
    p_status: status,
  });
  if (error) {
    console.error("set_registration_status failed:", error.message);
    return;
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/registrations/${id}`);
}

// Verify/reject an additional submission (Entry 2+). `registrationId` is passed
// only so the team detail page can be revalidated — the RPC keys off the
// submission id.
export async function setSubmissionStatus(
  id: string,
  status: string,
  registrationId: string,
): Promise<void> {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  if (!STATUSES.includes(status as Status)) return;

  const admin = createAdminClient();
  const { error } = await admin.rpc("set_submission_status", {
    p_id: id,
    p_status: status,
  });
  if (error) {
    console.error("set_submission_status failed:", error.message);
    return;
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/registrations/${registrationId}`);
}

