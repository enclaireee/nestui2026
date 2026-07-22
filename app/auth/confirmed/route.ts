import { NextResponse, type NextRequest } from "next/server";

// Supabase's password-reset email template still points here (an older
// redirect path that predates /auth/update-password) instead of respecting
// resetPasswordForEmail's `redirectTo` — see components/forgot-password-form.tsx.
// Rather than depend on a dashboard template edit, just forward the `code`
// query param along; the browser client on /auth/update-password auto-detects
// and exchanges it for a session (createBrowserClient defaults to
// detectSessionInUrl: true).
export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/update-password";
  return NextResponse.redirect(url);
}
