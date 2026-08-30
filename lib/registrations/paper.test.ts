// Run: npx tsx lib/registrations/paper.test.ts
// Covers the paper-round window — the gate that decides whether a full paper is
// accepted, so the WIB boundaries need to be exactly right.
//
// Healthineer     paper + video · 31 Aug – 13 Sep
// Healthynovation paper only    · 31 Aug – 13 Sep
// Medhack         no paper round (video submission instead)
import assert from "node:assert/strict";
import { COMPETITIONS, paperPhase } from "./config";

const at = (iso: string) => new Date(iso);
const phase = (id: Parameters<typeof paperPhase>[0], iso: string) => paperPhase(id, at(iso));

// Medhack has no paper round at all.
assert.equal(COMPETITIONS.medhack.paperSubmission, null);
assert.equal(phase("medhack", "2026-09-01T12:00:00+07:00"), "none");

// Before the window opens.
assert.equal(phase("healthineer", "2026-08-30T23:59:59+07:00"), "before");
// Opens at midnight WIB on the 31st.
assert.equal(phase("healthineer", "2026-08-31T00:00:00+07:00"), "open");
// Last second of the closing day is still open.
assert.equal(phase("healthineer", "2026-09-13T23:59:59+07:00"), "open");
// One second later it's shut.
assert.equal(phase("healthineer", "2026-09-14T00:00:00+07:00"), "closed");

// Boundaries are WIB, not UTC: 30 Aug 17:00 UTC is already 31 Aug in Jakarta.
assert.equal(phase("healthineer", "2026-08-30T17:00:00Z"), "open");
// ...and 13 Sep 17:00 UTC is already the 14th, so the window has shut.
assert.equal(phase("healthineer", "2026-09-13T17:00:00Z"), "closed");

// Healthynovation runs the same window.
assert.equal(phase("healthynovation", "2026-09-01T12:00:00+07:00"), "open");
assert.equal(phase("healthynovation", "2026-09-14T00:00:00+07:00"), "closed");

// Only Healthineer collects a video alongside the paper.
assert.equal(COMPETITIONS.healthineer.paperSubmission?.video, true);
assert.equal(COMPETITIONS.healthynovation.paperSubmission?.video, false);

// The paper round must NOT be gated on the fee window: registration closed on
// 14 Aug, weeks before papers are due. This is the bug the round would have
// inherited by reusing `currentFee`.
assert.equal(phase("healthineer", "2026-09-01T12:00:00+07:00"), "open");

console.log("paper round ok");
