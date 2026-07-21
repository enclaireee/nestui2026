// Run: npx tsx lib/registrations/validate.test.ts
// Covers the letter-of-originality rule: it is team-level (not per member) and
// required, so the leader step and the server action must both reject a draft
// without it — a team that slipped through unsigned is a disqualification
// argument after the fact.
import assert from "node:assert/strict";
import { COMPETITIONS } from "./config";
import { emptyPerson, type RegistrationDraft } from "./types";
import { validateDraft, validateLeader } from "./validate";

const cfg = COMPETITIONS.healthynovation; // minSize 1 → no members to fill in
const person = () => ({
  ...emptyPerson(),
  name: "Budi",
  email: "budi@example.com",
  phone: "081234567890",
  studentId: "12345",
  institution: "SMA 1",
  confirmationUrl: "https://drive.google.com/folder",
});

const draft = (originalityLetterUrl: string): RegistrationDraft => ({
  competition: "healthynovation",
  teamSize: 1,
  teamName: "Tim Satu",
  leader: person(),
  members: [],
  originalityLetterUrl,
  paymentProofUrl: "https://drive.google.com/payment",
  submissionUrl: "https://drive.google.com/submission",
});

// Missing and malformed links are both caught, keyed so the field renders inline.
assert.equal(
  validateLeader(draft(""), cfg).originalityLetterUrl,
  "Letter of originality link is required.",
);
assert.match(validateLeader(draft("not-a-link"), cfg).originalityLetterUrl, /valid link/);
assert.equal(validateLeader(draft("https://drive.google.com/x"), cfg).originalityLetterUrl, undefined);

// A leader whose own fields are all fine still fails the whole draft without it,
// so the server action rejects a client that skipped the field.
assert.equal(validateDraft(draft(""), cfg).ok, false);
assert.match(validateDraft(draft(""), cfg).message ?? "", /Letter of originality/);
assert.equal(validateDraft(draft("https://drive.google.com/x"), cfg).ok, true);

console.log("validate ok");
