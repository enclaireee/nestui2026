// Run: npx tsx lib/registrations/config.test.ts
// Covers the fee-tier date boundaries — the bit that decides how much money
// someone transfers, so the WIB cutoffs need to be exactly right.
import assert from "node:assert/strict";
import { currentFee } from "./config";

const at = (iso: string) => new Date(iso);
const fee = (id: Parameters<typeof currentFee>[0], iso: string) => currentFee(id, at(iso));

// Healthynovation: Early ≤19 Jul, Normal ≤31 Jul, Late ≤7 Aug (WIB).
assert.equal(fee("healthynovation", "2026-07-18T12:00:00+07:00")?.amount, 80_000);
// Last second of Early Bird is still Early Bird.
assert.equal(fee("healthynovation", "2026-07-19T23:59:59+07:00")?.label, "Early Bird");
// One second later rolls to Normal.
assert.equal(fee("healthynovation", "2026-07-20T00:00:00+07:00")?.amount, 100_000);
assert.equal(fee("healthynovation", "2026-08-01T09:00:00+07:00")?.amount, 120_000);
// Past the last tier → no price rather than a stale one.
assert.equal(fee("healthynovation", "2026-08-08T00:00:00+07:00"), null);

// Boundaries are WIB, not UTC: 19 Jul 23:00 UTC is already 20 Jul in Jakarta.
assert.equal(fee("healthynovation", "2026-07-19T23:00:00Z")?.label, "Normal");

// Medhack has only two tiers and later cutoffs.
assert.equal(fee("medhack", "2026-07-27T23:59:59+07:00")?.amount, 200_000);
assert.equal(fee("medhack", "2026-07-28T00:00:00+07:00")?.amount, 220_000);
assert.equal(fee("medhack", "2026-08-23T00:00:00+07:00"), null);

// Healthineer's third tier is labelled "Extend", not "Late".
assert.equal(fee("healthineer", "2026-08-05T12:00:00+07:00")?.label, "Extend");

console.log("fee tiers ok");
