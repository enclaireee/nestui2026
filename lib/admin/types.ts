import type { CompetitionId } from "@/lib/registrations/config";

export interface MemberRow {
  id: string;
  registration_id: string;
  member_index: number;
  name: string;
  email: string;
  phone: string;
  student_id: string;
  institution: string;
  major: string | null;
  confirmation_url: string;
}

// One row of the `submissions` table — an extra paid submission (Entry 2+) a
// team attaches after registering. Entry 1 lives inline on the registration.
export interface SubmissionRow {
  id: string;
  registration_id: string;
  payment_proof_url: string;
  submission_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
}

// One row of the admin_registrations_detail view (registration + members[]).
export interface AdminRegistration {
  id: string;
  code: string;
  user_id: string;
  competition: CompetitionId;
  team_name: string;
  team_size: number;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  leader_student_id: string;
  leader_institution: string;
  leader_major: string | null;
  leader_confirmation_url: string;
  payment_proof_url: string;
  submission_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  created_at: string;
  members: MemberRow[];
}

// Remove PostgREST filter metacharacters so a search term can't alter the
// `.or()` filter structure. (SQL injection is already impossible — PostgREST
// parameterizes values into the SQL — this guards the filter *grammar*.)
export function sanitizeSearch(q: string): string {
  return q.replace(/["\\(),*]/g, "").trim().slice(0, 80);
}
