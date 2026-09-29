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

// One row of the admin_submissions_detail view: every submission across all
// teams, flattened to one shape. Entry 1 is the inline submission on the
// registration (is_primary, entry_no 1); Entry 2+ are `submissions` rows.
// Carries the owning team's identifying columns so the submissions list can be
// sorted/searched on its own.
export interface AdminSubmissionDetail {
  // Registration id for Entry 1; the submissions-row id for Entry 2+. Unique.
  submission_id: string;
  registration_id: string;
  code: string;
  team_name: string;
  competition: CompetitionId;
  leader_email: string;
  is_primary: boolean;
  entry_no: number;
  payment_proof_url: string;
  submission_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
}

// One row of the `paper_submissions` table — a team's paper for the round that
// follows selection. At most one per team; re-submitting replaces it.
// `video_url` is Healthineer-only and null for Healthynovation.
export interface PaperSubmissionRow {
  id: string;
  registration_id: string;
  paper_url: string;
  video_url: string | null;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  updated_at: string;
}

// One row of the admin_papers_detail view: every paper across all teams, with
// the owning team's identifying columns so the Semifinal list can sort/search
// on its own. `video_url` is Healthineer-only.
export interface AdminPaperDetail {
  paper_id: string;
  registration_id: string;
  code: string;
  team_name: string;
  competition: CompetitionId;
  leader_email: string;
  paper_url: string;
  video_url: string | null;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  updated_at: string;
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
  // Nullable: teams that registered before the letter of originality was added
  // to the form have no value here.
  originality_letter_url: string | null;
  payment_proof_url: string;
  submission_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  created_at: string;
  is_finalist?: boolean;
  members: MemberRow[];
}

// One row of the `presentation_submissions` table — a finalist team's presentation deck (PPT/slides).
// At most one per team; re-submitting replaces it.
export interface PresentationSubmissionRow {
  id: string;
  registration_id: string;
  ppt_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  updated_at: string;
}

// One row of the admin_presentations_detail view: every finalist presentation deck across all teams.
export interface AdminPresentationDetail {
  presentation_id: string;
  registration_id: string;
  code: string;
  team_name: string;
  competition: CompetitionId;
  leader_email: string;
  ppt_url: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  updated_at: string;
}

// Remove PostgREST filter metacharacters so a search term can't alter the
// `.or()` filter structure. (SQL injection is already impossible — PostgREST
// parameterizes values into the SQL — this guards the filter *grammar*.)
export function sanitizeSearch(q: string): string {
  return q.replace(/["\\(),*]/g, "").trim().slice(0, 80);
}
