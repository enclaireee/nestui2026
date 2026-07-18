import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/sanitize";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// The only OTP types this app ever links to. Anything else in the query string
// is rejected here rather than handed to verifyOtp.
const OTP_TYPES = ["signup", "recovery", "email_change", "email", "invite", "magiclink"] as const;
const isOtpType = (v: string | null): v is EmailOtpType =>
  !!v && (OTP_TYPES as readonly string[]).includes(v);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const type = isOtpType(typeParam) ? typeParam : null;
  // `next` arrives from the confirmation link's query string, so it's attacker
  // controllable — see safeNextPath for why `//` alone isn't enough to check.
  const next = safeNextPath(searchParams.get("next"));

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
