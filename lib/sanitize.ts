// Defense-in-depth against stored XSS: strip HTML tags from free-text before it
// is persisted. React already escapes on render; this keeps the raw DB values
// clean too (and anything exported to CSV / opened in other tools).

import type { PersonDraft, RegistrationDraft } from "./registrations/types";

export function stripHtml(v: string): string {
  return v.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * A post-login redirect target that can only ever be a path on this site.
 * `next` arrives on the query string, so it is attacker-controlled: a bare
 * "starts with /" check still lets through `//evil.com` and `/\evil.com`, both
 * of which browsers resolve as protocol-relative external URLs — an open
 * redirect that makes a phishing page look like it came from us. Requiring the
 * second character to be neither / nor \ closes both.
 */
export function safeNextPath(requested: string | null, fallback = "/protected"): string {
  return requested && /^\/[^/\\]/.test(requested) ? requested : fallback;
}

function sanitizePerson(p: PersonDraft): PersonDraft {
  return {
    name: stripHtml(p.name),
    email: stripHtml(p.email),
    phone: stripHtml(p.phone),
    studentId: stripHtml(p.studentId),
    institution: stripHtml(p.institution),
    major: stripHtml(p.major),
    confirmationUrl: stripHtml(p.confirmationUrl),
  };
}

export function sanitizeDraft(d: RegistrationDraft): RegistrationDraft {
  return {
    competition: d.competition,
    teamSize: d.teamSize,
    teamName: stripHtml(d.teamName),
    leader: sanitizePerson(d.leader),
    members: d.members.map(sanitizePerson),
    paymentProofUrl: stripHtml(d.paymentProofUrl),
    submissionUrl: stripHtml(d.submissionUrl),
  };
}

// CSV formula-injection guard: a cell starting with = + - @ (or tab/CR) can be
// executed as a formula by Excel/Sheets. Prefix with a single quote.
export function csvSafe(v: unknown): string {
  const s = v == null ? "" : String(v);
  const needsGuard = /^[=+\-@\t\r]/.test(s);
  const guarded = needsGuard ? `'${s}` : s;
  return `"${guarded.replace(/"/g, '""')}"`;
}
