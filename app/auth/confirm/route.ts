import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/sanitize";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// The only OTP types this app ever issues: sign-up confirmation and password
// recovery. `invite`/`magiclink` are never sent, so they aren't accepted.
const OTP_TYPES = ["signup", "recovery", "email", "email_change"] as const;
const isOtpType = (v: string | null): v is EmailOtpType =>
  !!v && (OTP_TYPES as readonly string[]).includes(v);

// A fixed code, never a free-text message. Reflecting Supabase's (or an
// attacker's) error string onto our own error page would let anyone put
// arbitrary wording on a nestui2026 URL — escaped by React, so not XSS, but a
// ready-made phishing surface. The page maps these codes to its own copy.
export type AuthErrorCode = "missing_token" | "wrong_browser" | "expired";

// Explicit `never` so TypeScript treats a fail() call as terminating and
// narrows the checks below it.
function fail(code: AuthErrorCode): never {
  redirect(`/auth/error?code=${code}`);
}

// Supabase's messages aren't stable enough to parse for anything but this one
// case, which is worth splitting out because the user can actually act on it.
function classify(message: string): AuthErrorCode {
  return /code verifier/i.test(message) ? "wrong_browser" : "expired";
}

// Confirmation links land here. Supabase can deliver the confirmation in two
// different shapes depending on the email template, and this route has to
// accept both or the user ends up confirmed-but-signed-out:
//
//   ?code=…        PKCE. What the stock `{{ .ConfirmationURL }}` template
//                  produces, because createBrowserClient defaults to PKCE.
//                  Supabase's own /auth/v1/verify already consumed the token
//                  and bounced here, so the email is confirmed either way —
//                  but without exchanging the code there is no session.
//   ?token_hash=…  OTP. What a `{{ .TokenHash }}` template produces. No code
//                  verifier needed, so it also works from a different device.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // `next` arrives from the link's query string, so it's attacker controllable
  // — see safeNextPath for why checking `//` alone isn't enough.
  const next = safeNextPath(searchParams.get("next"));

  // Supabase reports its own failures (expired link, already used) this way.
  // The text is logged, not shown — see fail().
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    console.error("auth confirm: provider error:", providerError);
    fail("expired");
  }

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const type = isOtpType(typeParam) ? typeParam : null;

  const supabase = await createClient();

  // PKCE: needs the code_verifier cookie the browser client stored at sign-up,
  // so this only succeeds in the same browser the sign-up happened in.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("auth confirm: exchangeCodeForSession failed:", error.message);
      fail(classify(error.message));
    }
    redirect(next);
  }

  if (!token_hash || !type) fail("missing_token");

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) {
    console.error("auth confirm: verifyOtp failed:", error.message);
    fail(classify(error.message));
  }
  redirect(next);
}
