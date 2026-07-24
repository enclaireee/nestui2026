import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Escalating, per-key hard lockout for the admin login — the punishing layer on
// top of the plain rate limit. Backed by the DB (Step 20 in BACKEND.md) so it is
// correct across serverless instances. Three RPCs:
//   admin_lockout_status(key) -> seconds still locked (0 if free)   [read-only]
//   admin_lockout_fail(key)   -> seconds now locked after this fail [escalates]
//   admin_lockout_clear(key)  -> wipe the streak on a good login
//
// Escalation (grace of 4 fumbles, then it bites hard, per Step 20):
//   fails 1–4: free · 5: 5m · 6: 15m · 7: 1h · 8: 6h · 9+: 24h
// A lock HOLDS even if the correct password is entered during it — the gate is
// checked before the credential compare — so guessing right mid-lockout still
// fails. This is why it is keyed per-IP, not globally: a global hard lock would
// let an attacker brick the real admin out just by failing a lot.

// Postgres "undefined_function" — the Step 20 migration hasn't been run yet.
// Treated as "feature not installed" so deploying the code before the SQL does
// NOT brick admin login; every other DB error fails CLOSED (see below).
const UNDEFINED_FUNCTION = "42883";

// Fail CLOSED on a real DB error: this lockout is the only brute-force defense
// over a single static credential, so a hiccup must deny rather than wave
// attempts through. Short enough that a transient blip self-heals in a minute.
const LOCK_ON_ERROR_SECONDS = 60;

export async function lockoutSecondsRemaining(key: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("admin_lockout_status", { p_key: key });
    if (error) {
      if (error.code === UNDEFINED_FUNCTION) return 0; // migration not run yet
      console.error("admin_lockout_status failed:", error.message);
      return LOCK_ON_ERROR_SECONDS;
    }
    return typeof data === "number" ? data : 0;
  } catch (err) {
    console.error("admin_lockout_status threw:", err);
    return LOCK_ON_ERROR_SECONDS;
  }
}

/** Record a failed attempt; returns seconds this key is now locked (0 = grace). */
export async function recordAdminFailure(key: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("admin_lockout_fail", { p_key: key });
    if (error) {
      if (error.code !== UNDEFINED_FUNCTION)
        console.error("admin_lockout_fail failed:", error.message);
      return 0;
    }
    return typeof data === "number" ? data : 0;
  } catch (err) {
    console.error("admin_lockout_fail threw:", err);
    return 0;
  }
}

export async function clearAdminLockout(key: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("admin_lockout_clear", { p_key: key });
    if (error && error.code !== UNDEFINED_FUNCTION)
      console.error("admin_lockout_clear failed:", error.message);
  } catch (err) {
    console.error("admin_lockout_clear threw:", err);
  }
}

/** Human-readable remaining time for the lockout message. */
export function formatLockDuration(secs: number): string {
  if (secs >= 3600) {
    const h = Math.round(secs / 3600);
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  const m = Math.max(1, Math.ceil(secs / 60));
  return `${m} minute${m === 1 ? "" : "s"}`;
}
