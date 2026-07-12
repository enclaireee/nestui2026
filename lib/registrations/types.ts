import type { CompetitionId } from "./config";

export interface PersonDraft {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  institution: string;
  major: string; // "" when the competition has no major field
  confirmationUrl: string;
}

export interface RegistrationDraft {
  competition: CompetitionId | null;
  teamSize: number | null;
  teamName: string;
  leader: PersonDraft;
  members: PersonDraft[];
  paymentProofUrl: string;
  submissionUrl: string;
}

export function emptyPerson(): PersonDraft {
  return {
    name: "",
    email: "",
    phone: "",
    studentId: "",
    institution: "",
    major: "",
    confirmationUrl: "",
  };
}

export function emptyDraft(): RegistrationDraft {
  return {
    competition: null,
    teamSize: null,
    teamName: "",
    leader: emptyPerson(),
    members: [],
    paymentProofUrl: "",
    submissionUrl: "",
  };
}

// snake_case shape sent to the submit_registration RPC (matches SQL m->>'...' keys)
export interface MemberPayload {
  name: string;
  email: string;
  phone: string;
  student_id: string;
  institution: string;
  major: string | null;
  confirmation_url: string;
}
