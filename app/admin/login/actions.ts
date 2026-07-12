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
  // Rate limit brute force against the single known credential (10 / 10 min / IP).
  const hdrs = await headers();
  const allowed = await checkRateLimit(`admin_login:${clientIp(hdrs)}`, 10, 600);
  if (!allowed) return { error: "Too many attempts. Please wait and try again." };

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return { error: "Admin login is not configured." };

  const ok = safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
  if (!ok) return { error: "Invalid username or password." };

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
