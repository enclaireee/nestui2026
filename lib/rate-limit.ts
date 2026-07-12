import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Fixed-window rate limit backed by the DB `check_rate_limit` function, so it is
// correct across serverless instances (an in-memory Map would reset per cold
// start). Fails open (allows) on a DB error so a transient hiccup can't lock
// legitimate users out — rate limiting here is spam mitigation, not the primary
// access control.
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("check_rate_limit failed:", error.message);
      return true;
    }
    return data === true;
  } catch (err) {
    console.error("check_rate_limit threw:", err);
    return true;
  }
}

// Best-effort client IP from proxy headers (Vercel sets x-forwarded-for).
export function clientIp(headers: Headers): string {
  return (headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
}
