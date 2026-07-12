import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SECRET key (sb_secret_…). Bypasses RLS.
// The `server-only` import makes the build fail if this is ever imported into a
// client component, so the secret can never reach the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
