// Run: npx tsx lib/sanitize.test.ts
// Covers the CSV formula-injection guard on the admin export.
import assert from "node:assert/strict";
import { csvSafe, safeNextPath } from "./sanitize";

// Open-redirect guard on the post-login `?next=` destination.
assert.equal(safeNextPath("/branding/registration"), "/branding/registration");
assert.equal(safeNextPath("//evil.com"), "/protected"); // protocol-relative
assert.equal(safeNextPath("/\\evil.com"), "/protected"); // backslash variant
assert.equal(safeNextPath("https://evil.com"), "/protected");
assert.equal(safeNextPath(null), "/protected");
assert.equal(safeNextPath(""), "/protected");

// CSV formula injection: a leading =, +, -, @ must not reach Excel unguarded.
assert.equal(csvSafe("=1+1"), `"'=1+1"`);
assert.equal(csvSafe("@SUM(A1)"), `"'@SUM(A1)"`);
assert.equal(csvSafe("Budi"), `"Budi"`);
// Embedded quotes are doubled, not dropped.
assert.equal(csvSafe('a"b'), `"a""b"`);

console.log("sanitize ok");
