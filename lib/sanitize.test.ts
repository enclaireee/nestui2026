// Run: npx tsx lib/sanitize.test.ts
// Covers the open-redirect guard on the emailed `?next=` link — the one place
// where a query param decides where a just-authenticated user lands.
import assert from "node:assert/strict";
import { safeNextPath, csvSafe } from "./sanitize";

// Ordinary same-origin paths pass through untouched.
assert.equal(safeNextPath("/protected"), "/protected");
assert.equal(safeNextPath("/auth/confirmed"), "/auth/confirmed");
assert.equal(safeNextPath("/protected?tab=1#top"), "/protected?tab=1#top");

// Protocol-relative — the classic bypass.
assert.equal(safeNextPath("//evil.com"), "/protected");
// Backslash variant: browsers normalise `/\` to `//`, so it must be rejected too.
assert.equal(safeNextPath("/\\evil.com"), "/protected");
assert.equal(safeNextPath("/\\\\evil.com"), "/protected");
// Absolute URLs of any scheme.
assert.equal(safeNextPath("https://evil.com"), "/protected");
assert.equal(safeNextPath("javascript:alert(1)"), "/protected");
// Missing / empty / relative.
assert.equal(safeNextPath(null), "/protected");
assert.equal(safeNextPath(""), "/protected");
assert.equal(safeNextPath("evil.com"), "/protected");
assert.equal(safeNextPath("/"), "/protected"); // bare slash has no second char

// CSV formula injection: a leading =, +, -, @ must not reach Excel unguarded.
assert.equal(csvSafe("=1+1"), `"'=1+1"`);
assert.equal(csvSafe("@SUM(A1)"), `"'@SUM(A1)"`);
assert.equal(csvSafe("Budi"), `"Budi"`);
// Embedded quotes are doubled, not dropped.
assert.equal(csvSafe('a"b'), `"a""b"`);

console.log("sanitize ok");
