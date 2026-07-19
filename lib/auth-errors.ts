// Supabase Auth returns developer-facing strings ("email rate limit exceeded")
// that mean nothing to a competition entrant and read as if they did something
// wrong. Map the ones we actually hit to copy that says what to do next;
// anything unrecognised falls through unchanged so we never hide a real error.
//
// Matching is on substrings because Supabase's wording is not a stable API —
// the codes are, but the SDK surfaces the message here.
const FRIENDLY: [RegExp, string][] = [
  [
    /email rate limit exceeded|over_email_send_rate_limit/i,
    // Project-wide hourly cap on auth emails, not something this user caused.
    "We're temporarily unable to send confirmation emails. This is on our side, not yours — please wait a few minutes and try again, or contact us if it keeps happening.",
  ],
  [
    /for security purposes.*after \d+ seconds|over_request_rate_limit/i,
    "Please wait a moment before trying again.",
  ],
  [
    /user already registered|already been registered/i,
    "An account with this email already exists. Try logging in instead.",
  ],
  [
    /invalid login credentials/i,
    "Incorrect email or password. Please check and try again.",
  ],
  [
    /password should be at least/i,
    "Password must be at least 8 characters.",
  ],
];

export function friendlyAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (!message) return "Something went wrong. Please try again.";
  return FRIENDLY.find(([pattern]) => pattern.test(message))?.[1] ?? message;
}
