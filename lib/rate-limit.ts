import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Fixed-window rate limit backed by the DB `check_rate_limit` function, so it is
// correct across serverless instances (an in-memory Map would reset per cold
// start).
//
// Default is fail-OPEN (allow) on a DB error: for the registration form the
// limit is spam mitigation, not access control, and a transient hiccup must not
// lock legitimate entrants out during a deadline rush.
//
// `failClosed` flips that for the admin login, where the limit IS the only
// brute-force defense over a single static credential — there, a DB error that
// silently disabled throttling would be worse than a few minutes of downtime.
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
  { failClosed = false }: { failClosed?: boolean } = {},
): Promise<boolean> {
  const onError = !failClosed;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("check_rate_limit failed:", error.message);
      return onError;
    }
    return data === true;
  } catch (err) {
    console.error("check_rate_limit threw:", err);
    return onError;
  }
}

// Best-effort client IP. Vercel sets `x-vercel-forwarded-for` itself and it
// cannot be spoofed by the caller, so prefer it; `x-forwarded-for` is only a
// fallback for other hosts (there its first entry is caller-supplied, which is
// why no per-IP limit is trusted on its own — see the global keys below).
export function clientIp(headers: Headers): string {
  const raw =
    headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for") ?? "";
  return raw.split(",")[0].trim() || "unknown";
}
