// Run: npx tsx lib/registrations/presentation.test.ts
// Covers finalist eligibility and the final presentation deck window.

import assert from "node:assert/strict";
import {
  FINALIST_CODES,
  FINAL_PPT_DEADLINE,
  FINAL_PPT_OPENS,
  finalPhase,
  isFinalistTeam,
} from "./config";

// 1. Verify 11 finalist teams are in the set
assert.equal(FINALIST_CODES.size, 11);
assert.ok(FINAL_PPT_OPENS);
assert.ok(FINAL_PPT_DEADLINE);

const expectedHealthynovation = [
  "NEST2026-HNV-0010", // BioNexaS
  "NEST2026-HNV-0007", // NexThera
  "NEST2026-HNV-0022", // AERIS
  "NEST2026-HNV-0030", // GLUCOSENSE
  "NEST2026-HNV-0034", // H-3
];

const expectedHealthineer = [
  "NEST2026-HTN-0015", // Mama aku mw ke jkt
  "NEST2026-HTN-0003", // Garden House
  "NEST2026-HTN-0007", // Pilar Kehidupan
  "NEST2026-HTN-0005", // Say Wallahi
  "NEST2026-HTN-0006", // Posture Rangers
  "NEST2026-HTN-0013", // Adalah Pokoknya
];

for (const code of [...expectedHealthynovation, ...expectedHealthineer]) {
  assert.equal(isFinalistTeam(code), true, `Expected ${code} to be a finalist`);
}

// 2. Non-finalist code returns false
assert.equal(isFinalistTeam("NEST2026-HTN-0001"), false);
assert.equal(isFinalistTeam("NEST2026-HNV-0001"), false);
assert.equal(isFinalistTeam("NEST2026-MDH-0001"), false);

// 3. Database flag isFinalist takes precedence if true
assert.equal(isFinalistTeam("NEST2026-HTN-9999", true), true);
assert.equal(isFinalistTeam("NEST2026-HTN-9999", false), false);

// 4. Window testing
const at = (iso: string) => new Date(iso);

// Before opens (before 2026-09-28)
assert.equal(finalPhase(at("2026-09-27T23:59:59+07:00")), "before");

// When open (now: 2026-09-29)
assert.equal(finalPhase(at("2026-09-29T12:00:00+07:00")), "open");

// Right before deadline (2026-10-02 23:59:59 WIB)
assert.equal(finalPhase(at("2026-10-02T23:59:59+07:00")), "open");

// Exactly at closed (2026-10-03 00:00:00 WIB)
assert.equal(finalPhase(at("2026-10-03T00:00:00+07:00")), "closed");

// UTC equivalence: 2026-10-02 16:59:59Z is 23:59:59 WIB (open)
assert.equal(finalPhase(at("2026-10-02T16:59:59Z")), "open");

// 2026-10-02 17:00:00Z is 2026-10-03 00:00:00 WIB (closed)
assert.equal(finalPhase(at("2026-10-02T17:00:00Z")), "closed");

console.log("presentation finalist tests ok");
