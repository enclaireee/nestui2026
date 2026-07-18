import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: separate from Supabase auth. Redirect unauthenticated visitors
  // to /admin/login (real enforcement is also in the (protected) layout + each
  // admin route — this is the UX-level guard). /admin/login stays public.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  /*
   * Only the paths that this proxy actually makes a decision about. Matching
   * everything meant a blocking supabase.auth.getUser() network round-trip on
   * every public page view (Home, About, assets) for no reason — that was the
   * lag. Public pages need no session: the header reads auth client-side and
   * every protected page re-checks getUser() itself.
   */
  matcher: [
    "/admin/:path*",
    "/protected/:path*",
    "/branding/registration/:path*",
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
  ],
};
