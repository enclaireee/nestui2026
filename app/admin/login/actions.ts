"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/admin/session";
import {
  clearAdminLockout,
  formatLockDuration,
  lockoutSecondsRemaining,
  recordAdminFailure,
} from "@/lib/admin/lockout";

export interface AdminLoginState {
  error?: string;
}

// Constant-time string compare so a wrong password can't be timed out char-by-char.
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const lockKey = `admin_login:${ip}`;

  // Distributed-flood throttle: 100 / hour across ALL IPs, fail CLOSED. The
  // per-IP hard lockout below is the primary brute-force defense; this is the
  // backstop a single-IP counter can't provide against rotating-IP / spoofed-XFF
  // attacks. It is a plain window (no hard lock) precisely so an attacker can't
  // weaponise it to lock the real admin out — that's the per-IP lock's job.
  const globalOk = await checkRateLimit("admin_login:global", 100, 3600, {
    failClosed: true,
  });
  if (!globalOk) return { error: "Too many attempts. Please wait and try again." };

  // Hard escalating lockout, checked BEFORE the credential compare so a correct
  // guess cannot slip past an active lock. Fail CLOSED (see lib/admin/lockout).
  const lockedFor = await lockoutSecondsRemaining(lockKey);
  if (lockedFor > 0)
    return {
      error: `Too many failed attempts. This device is locked for ${formatLockDuration(lockedFor)}.`,
    };

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return { error: "Admin login is not configured." };

  const ok = safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
  if (!ok) {
    // Escalate this device's failure streak. If that just tripped a lock, say so.
    const secs = await recordAdminFailure(lockKey);
    if (secs > 0)
      return {
        error: `Too many failed attempts. This device is locked for ${formatLockDuration(secs)}.`,
      };
    return { error: "Invalid username or password." };
  }

  // Good login — wipe this device's failure streak.
  await clearAdminLockout(lockKey);

  // Admin auth is deliberately separate from the regular user login — clear
  // any existing Supabase user session so the two never overlap.
  const supabase = await createClient();
  await supabase.auth.signOut();

  const token = await createSessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  redirect("/admin");
}
