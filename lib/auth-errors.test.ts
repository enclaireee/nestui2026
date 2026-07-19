// Run: npx tsx lib/auth-errors.test.ts
// The mapping has to catch Supabase's real wording — if a pattern stops
// matching, entrants see raw SDK text like "email rate limit exceeded".
import assert from "node:assert/strict";
import { friendlyAuthError } from "./auth-errors";

const rateLimited = friendlyAuthError(new Error("email rate limit exceeded"));
assert.match(rateLimited, /on our side, not yours/);
// Same case, newer error-code form.
assert.equal(friendlyAuthError(new Error("over_email_send_rate_limit")), rateLimited);

// The per-request throttle Supabase applies between sends.
assert.equal(
  friendlyAuthError(new Error("For security purposes, you can only request this after 51 seconds.")),
  "Please wait a moment before trying again.",
);

assert.match(friendlyAuthError(new Error("User already registered")), /already exists/);
assert.match(friendlyAuthError(new Error("Invalid login credentials")), /Incorrect email or password/);

// Unknown errors pass through untouched — never hide a real failure.
assert.equal(friendlyAuthError(new Error("Network request failed")), "Network request failed");

// Non-Error inputs and empty messages still produce something showable.
assert.equal(friendlyAuthError(null), "Something went wrong. Please try again.");
assert.equal(friendlyAuthError(new Error("")), "Something went wrong. Please try again.");
assert.equal(friendlyAuthError("boom"), "boom");

console.log("auth errors ok");
