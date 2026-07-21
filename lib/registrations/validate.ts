// Pure validators shared by the client wizard and the server action.
// Never trust the client — the server calls validateDraft() again before insert.

import type { CompetitionConfig } from "./config";
import { isValidTeamSize } from "./config";
import type { PersonDraft, RegistrationDraft } from "./types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[+()\-\s\d]{5,30}$/;
export const URL_RE = /^https?:\/\/\S+$/i;

export type FieldErrors = Record<string, string>;

export function validatePerson(p: PersonDraft, cfg: CompetitionConfig): FieldErrors {
  const e: FieldErrors = {};
  if (!p.name.trim()) e.name = "Name is required.";
  if (!p.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(p.email.trim())) e.email = "Enter a valid email.";
  if (!p.phone.trim()) e.phone = "Phone number is required.";
  else if (!PHONE_RE.test(p.phone.trim())) e.phone = "Enter a valid phone number.";
  if (!p.studentId.trim()) e.studentId = `${cfg.studentIdLabel} is required.`;
  if (!p.institution.trim()) e.institution = `${cfg.institutionLabel} is required.`;
  if (cfg.hasMajor && !p.major.trim()) e.major = "Major / Jurusan is required.";
  if (!p.confirmationUrl.trim()) e.confirmationUrl = "Confirmation link is required.";
  else if (!URL_RE.test(p.confirmationUrl.trim()))
    e.confirmationUrl = "Enter a valid link (starting with http).";
  return e;
}

/**
 * Everything the leader step collects: the leader's own fields plus the team's
 * letter of originality. Keyed the same way as validatePerson so the wizard can
 * render both sets of errors inline off one object.
 */
export function validateLeader(
  draft: RegistrationDraft,
  cfg: CompetitionConfig,
): FieldErrors {
  const e = validatePerson(draft.leader, cfg);
  const url = draft.originalityLetterUrl.trim();
  if (!url) e.originalityLetterUrl = "Letter of originality link is required.";
  else if (!URL_RE.test(url))
    e.originalityLetterUrl = "Enter a valid link (starting with http).";
  return e;
}

function allEmails(draft: RegistrationDraft): string[] {
  return [draft.leader.email, ...draft.members.map((m) => m.email)]
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

export function hasDuplicateEmails(draft: RegistrationDraft): boolean {
  const emails = allEmails(draft);
  return new Set(emails).size !== emails.length;
}

export interface DraftValidation {
  ok: boolean;
  /** first human-readable problem, for the server action + inline banner */
  message: string | null;
}

// Full validation of an entire draft. `cfg` is the selected competition.
export function validateDraft(
  draft: RegistrationDraft,
  cfg: CompetitionConfig,
): DraftValidation {
  if (!draft.competition) return fail("Please choose a competition.");
  if (draft.teamSize == null) return fail("Please choose a team size.");
  if (!isValidTeamSize(cfg.id, draft.teamSize))
    return fail(`Team size must be between ${cfg.minSize} and ${cfg.maxSize}.`);
  if (draft.members.length !== draft.teamSize - 1)
    return fail("Member count does not match the chosen team size.");
  if (!draft.teamName.trim()) return fail("Team name is required.");

  const leaderErr = validateLeader(draft, cfg);
  if (Object.keys(leaderErr).length) return fail(`Team leader: ${firstOf(leaderErr)}`);

  for (let i = 0; i < draft.members.length; i++) {
    const mErr = validatePerson(draft.members[i], cfg);
    if (Object.keys(mErr).length) return fail(`Member ${i + 1}: ${firstOf(mErr)}`);
  }

  if (hasDuplicateEmails(draft))
    return fail("Each participant must use a different email.");

  if (!draft.paymentProofUrl.trim()) return fail("Payment proof link is required.");
  else if (!URL_RE.test(draft.paymentProofUrl.trim()))
    return fail("Payment proof must be a valid link.");
  if (!draft.submissionUrl.trim()) return fail("Submission link is required.");
  else if (!URL_RE.test(draft.submissionUrl.trim()))
    return fail("Submission must be a valid link.");

  return { ok: true, message: null };
}

function fail(message: string): DraftValidation {
  return { ok: false, message };
}
function firstOf(errors: FieldErrors): string {
  return Object.values(errors)[0] ?? "invalid";
}
