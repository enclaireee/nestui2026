// Run: npx tsx lib/sanitize.test.ts
// Covers the CSV formula-injection guard on the admin export.
import assert from "node:assert/strict";
import { csvSafe, safeNextPath } from "./sanitize";

// Open-redirect guard on the post-login `?next=` destination. This value goes
// straight into window.location.replace(), so every one of these must stay on
// this origin.
assert.equal(safeNextPath("/branding/registration"), "/branding/registration");
assert.equal(safeNextPath("/protected?submitted=1"), "/protected?submitted=1"); // query survives
assert.equal(safeNextPath("//evil.com"), "/protected"); // protocol-relative
assert.equal(safeNextPath("/\\evil.com"), "/protected"); // backslash variant
assert.equal(safeNextPath("https://evil.com"), "/protected");
assert.equal(safeNextPath("javascript:alert(1)"), "/protected");
assert.equal(safeNextPath(null), "/protected");
assert.equal(safeNextPath(""), "/protected");

// The regression that motivated rewriting this on the URL parser: browsers
// strip TAB/LF/CR *before* parsing, so each of these collapses to `//evil.com`
// and redirected off-site. Reachable as ?next=/%09/evil.com.
assert.equal(safeNextPath("/\t/evil.com"), "/protected");
assert.equal(safeNextPath("/\n/evil.com"), "/protected");
assert.equal(safeNextPath("/\r/evil.com"), "/protected");
// Same trick without the second slash is harmless, but must stay on-origin.
assert.ok(!safeNextPath("/\tevil.com").startsWith("//"));

// CSV formula injection: a leading =, +, -, @ must not reach Excel unguarded.
assert.equal(csvSafe("=1+1"), `"'=1+1"`);
assert.equal(csvSafe("@SUM(A1)"), `"'@SUM(A1)"`);
assert.equal(csvSafe("Budi"), `"Budi"`);
// Embedded quotes are doubled, not dropped.
assert.equal(csvSafe('a"b'), `"a""b"`);

console.log("sanitize ok");
