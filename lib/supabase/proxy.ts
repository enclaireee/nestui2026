import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/sanitize";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/sign-up" ||
    pathname === "/auth/forgot-password";

  // Only the registration flow requires a signed-in user — Home, About,
  // and everything else stay public.
  if (!user && pathname.startsWith("/branding/registration")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    // Remember the destination so login can return the user there instead of
    // dropping them on the dashboard to navigate back by hand.
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Already signed in — no reason to see the login/sign-up/forgot-password forms again.
  if (user && isAuthPage) {
    // safeNextPath returns path + query, and `next` is set above as
    // `pathname + search` — so assigning it to url.pathname percent-encoded the
    // "?" and produced a 404 (/branding/registration%3Ffoo=1). Resolving it as
    // a URL against our own origin keeps the query intact, and safeNextPath has
    // already guaranteed it can't point anywhere else.
    return NextResponse.redirect(
      new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.nextUrl.origin),
    );
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
