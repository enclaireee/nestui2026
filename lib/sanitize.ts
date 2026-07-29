// Defense-in-depth against stored XSS: strip HTML tags from free-text before it
// is persisted. React already escapes on render; this keeps the raw DB values
// clean too (and anything exported to CSV / opened in other tools).

import type { PersonDraft, RegistrationDraft } from "./registrations/types";

export function stripHtml(v: string): string {
  return v.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Throwaway origin to resolve candidate paths against. `.invalid` is reserved
 *  by RFC 2606 and can never resolve to a real host. */
const PROBE_ORIGIN = "https://nest.invalid";

/**
 * A post-login redirect target that can only ever be a path on this site.
 *
 * `next` arrives on the query string, so it is attacker-controlled, and this
 * value is handed straight to `window.location.replace()`. Two hand-rolled
 * versions of this check have now been wrong:
 *
 *   1. "starts with /" let through `//evil.com` (protocol-relative).
 *   2. "starts with / and the second char is neither / nor \" still let through
 *      `/<TAB>/evil.com`. The URL parser strips TAB, LF and CR *before*
 *      parsing, so that string becomes `//evil.com` again — a working open
 *      redirect, reachable as `?next=/%09/evil.com`. See sanitize.test.ts.
 *
 * So stop pattern-matching and ask the parser, which is the only thing that
 * knows every way a string can escape a path. Resolve against a throwaway
 * origin and require the result to have stayed on it. That also covers
 * `javascript:` (origin "null") and any escape hatch not invented yet.
 */
export function safeNextPath(requested: string | null, fallback = "/protected"): string {
  if (!requested) return fallback;
  try {
    const u = new URL(requested, PROBE_ORIGIN);
    if (u.origin !== PROBE_ORIGIN) return fallback;
    // Rebuild from parsed parts rather than echoing the input, so the caller
    // never sees the raw attacker string.
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
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
    originalityLetterUrl: stripHtml(d.originalityLetterUrl),
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
