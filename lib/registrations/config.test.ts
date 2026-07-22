// Run: npx tsx lib/registrations/config.test.ts
// Covers the fee-tier date boundaries — the bit that decides how much money
// someone transfers, so the WIB cutoffs need to be exactly right.
//
// 2026 guidebook fee windows (all end 23:59 WIB on the `until` day):
//   MedHack        Early 200k ≤ 2 Aug · Normal 220k ≤ 25 Aug
//   Healthineer    Early 175k ≤ 2 Aug · Normal 200k ≤ 14 Aug
//   Healthynovation Early  80k ≤ 2 Aug · Normal 100k ≤ 14 Aug
import assert from "node:assert/strict";
import { currentFee } from "./config";

const at = (iso: string) => new Date(iso);
const fee = (id: Parameters<typeof currentFee>[0], iso: string) => currentFee(id, at(iso));

// Healthynovation: two tiers, Early ≤ 2 Aug then Normal ≤ 14 Aug (WIB).
assert.equal(fee("healthynovation", "2026-07-25T12:00:00+07:00")?.amount, 80_000);
// Last second of Early Bird is still Early Bird.
assert.equal(fee("healthynovation", "2026-08-02T23:59:59+07:00")?.label, "Early Bird");
// One second later rolls to Normal.
assert.equal(fee("healthynovation", "2026-08-03T00:00:00+07:00")?.amount, 100_000);
// Past the last tier → no price rather than a stale one.
assert.equal(fee("healthynovation", "2026-08-15T00:00:00+07:00"), null);

// Boundaries are WIB, not UTC: 2 Aug 17:00 UTC is already 3 Aug in Jakarta.
assert.equal(fee("healthynovation", "2026-08-02T17:00:00Z")?.label, "Normal");

// Medhack has the same two labels but a later Normal cutoff (25 Aug).
assert.equal(fee("medhack", "2026-08-02T23:59:59+07:00")?.amount, 200_000);
assert.equal(fee("medhack", "2026-08-03T00:00:00+07:00")?.amount, 220_000);
assert.equal(fee("medhack", "2026-08-25T23:59:59+07:00")?.label, "Normal");
assert.equal(fee("medhack", "2026-08-26T00:00:00+07:00"), null);

// Healthineer closes Normal on 14 Aug, unlike Medhack's 25 Aug.
assert.equal(fee("healthineer", "2026-08-10T12:00:00+07:00")?.amount, 200_000);
assert.equal(fee("healthineer", "2026-08-15T00:00:00+07:00"), null);

// No competition has a third tier any more.
for (const id of ["medhack", "healthineer", "healthynovation"] as const) {
  assert.ok(currentFee(id, at("2026-01-01T00:00:00+07:00"))); // some tier is open early on
}

console.log("fee tiers ok");
