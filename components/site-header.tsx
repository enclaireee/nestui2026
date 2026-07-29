"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { LogOut, LayoutDashboard, Menu, X, ArrowRight, ChevronRight, Home, Users, ClipboardList, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PopUpTemplate } from "@/components/registration/pop-up-template";

const navLinks = [
  { label: "Home", href: "/branding/mainpage", icon: Home },
  { label: "About us", href: "/branding/aboutpage", icon: Users },
  { label: "Registration", href: "/branding/registration", icon: ClipboardList },
  { label: "Contact", href: "/branding/contact", icon: Mail },
];

/**
 * The nav list, rendered from a pathname passed in as a plain prop.
 *
 * `pathname` is threaded through rather than read here for a specific reason:
 * usePathname() is request-time data, and with Cache Components enabled this
 * whole header sits in the root layout — reading the URL directly in it made
 * `/protected/resubmit/[id]` fail to prerender outright ("Uncached data was
 * accessed outside of <Suspense>") and broke the build. See the same warning
 * in site-chrome.tsx. So the read is isolated in <ActiveNavList> below and
 * wrapped in Suspense; this component stays pure and prerenders fine.
 */
function NavList({
  pathname,
  variant,
  onNavigate,
}: {
  /** null while the Suspense fallback renders — nothing is marked active. */
  pathname: string | null;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  if (variant === "mobile") {
    // 56px rows, full-bleed, chevron affordance — a phone navigation list,
    // not the desktop pill row reflowed into a column. No per-item entry
    // animation: the sheet itself slides in, and staggering four rows on top
    // of that just delayed the thing the user already asked for.
    return (
      <>
        {navLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`group flex min-h-14 items-center gap-4 rounded-2xl px-3 text-base font-semibold transition-colors active:scale-[0.98] ${
                active
                  ? "bg-brand-lime/15 text-brand-lime ring-1 ring-brand-lime/30"
                  : "text-white/85 active:bg-white/10"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-brand-lime/20 text-brand-lime"
                    : "bg-white/[0.07] text-white/60"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">{link.label}</span>
              <ChevronRight
                className={`h-5 w-5 shrink-0 ${active ? "text-brand-lime/70" : "text-white/25"}`}
              />
            </Link>
          );
        })}
      </>
    );
  }

  return (
    // Inline, not absolutely centred: the links now live inside the dock's
    // right pill and flow with it, so the pill can size to its own content.
    <div className="hidden items-center gap-0.5 md:flex">
      {navLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            // py-3, not py-1.5: from md up the hamburger is hidden, so THIS is
            // the nav a tablet and a landscape phone actually get — and at
            // py-1.5 every link was a 32px-tall touch target.
            className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 py-3 text-sm font-medium transition-colors duration-150 ${
              active ? "text-brand-lime" : "text-white/80 hover:text-white"
            }`}
          >
            {/* One shared layoutId across all four links, so framer animates
                the SAME element between positions rather than cross-fading
                two — the pill physically slides to the new route. */}
            {active && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-brand-lime/15 ring-1 ring-brand-lime/30"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

/** The one component that touches request-time data. Always Suspense-wrapped. */
function ActiveNavList(props: Omit<React.ComponentProps<typeof NavList>, "pathname">) {
  return <NavList {...props} pathname={usePathname()} />;
}

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);

  // Drives the hairline progress bar along the top edge. Reads scroll position
  // directly into a MotionValue — never through React state — so scrolling
  // doesn't re-render the header on every frame.
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const supabase = createClient();
    // getSession() reads the JWT from local storage — no network round-trip. This
    // button is cosmetic; real enforcement lives in proxy.ts and each protected
    // page's own getUser(). getUser() here cost a Supabase auth request on every
    // page load and made the button flip from "Login Now" after hydration.
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  // Condensed state past the fold: the bar tightens and goes fully opaque.
  // `passive` because this listener never calls preventDefault, and a
  // non-passive scroll listener blocks the compositor from scrolling until it
  // returns. Only ever flips a boolean, so at most one re-render per crossing.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drive the native <dialog>. showModal() is what gives the sheet its focus
  // trap, its inert background and its Esc handling — the old dropdown had
  // none of them and left 15 elements behind it tabbable.
  // The one thing showModal does NOT do is stop the page scrolling behind it,
  // hence the explicit body lock.
  //
  // It deliberately does NOT watch pathname to auto-close: that would pull
  // request-time data back into this component and re-break the build — the
  // reason NavList takes pathname as a prop at all. Link taps call onNavigate.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    if (menuOpen && !el.open) {
      el.showModal();
      document.body.style.overflow = "hidden";
    } else if (!menuOpen && el.open) {
      el.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    // Hard navigation, mirror of login — see login-form.tsx. Without it the
    // Router Cache keeps serving the logged-IN payload of any protected page
    // still in the back/forward history. A full load also drops every piece of
    // client state, which is what you want on sign-out.
    window.location.replace("/auth/login");
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="sticky top-0 z-50 w-full px-4 pt-3 [@media(max-height:500px)]:pt-1.5 sm:pt-4"
    >
      {/* Scroll progress — a full-bleed hairline at the very top edge. With a
          split dock there is no single pill to hang it off, and stretching it
          across the gap between them would just draw a line through empty
          space. scaleX is driven straight off a MotionValue, so this never
          re-renders. */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-brand-lime to-brand-cream"
        style={{ scaleX: scrollYProgress }}
      />

      {/* THE SPLIT DOCK.
          At rest: two separate pills pinned to opposite ends of the container.
          Scrolled: they slide together and fuse into one.

          `layout="position"` rather than plain `layout` is load-bearing —
          plain layout animates size as well, and framer implements that with
          scale transforms, which visibly distorts the wordmark and nav labels
          mid-flight. Position-only keeps every glyph crisp. It also means the
          pills must not change size between states, which is why padding is
          identical in both and only radius/border/background move. */}
      <motion.nav
        layout
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`mx-auto flex max-w-4xl items-center ${
          scrolled ? "justify-center gap-0" : "justify-between gap-3"
        }`}
      >
        {/* ---- Left pill: identity ---- */}
        <motion.div
          layout="position"
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          // NO `ring-1` in the base string. It used to live here with `ring-0`
          // in the scrolled branch, but Tailwind emits ring-1 after ring-0 so
          // the base always won — leaving a 1px ring on all four sides of both
          // pills, in the DEFAULT ring colour (blue-500/50, since the scrolled
          // branch had dropped ring-white/5). A ring draws on every edge, so
          // that was the hairline seam straight down the middle of the merged
          // pill. The ring is now declared only in the branch that wants one.
          className={`flex h-12 shrink-0 items-center border py-0 pl-4 pr-4 [@media(max-height:500px)]:h-10 transition-[background-color,border-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled
              ? // Inner edge loses its radius AND its border, so the two halves
                // read as one continuous pill with no seam down the middle.
                "rounded-l-full rounded-r-none border-r-0 border-white/20 bg-brand-green shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]"
              : "rounded-full border-white/15 bg-brand-green/80 shadow-lg shadow-black/10 ring-1 ring-white/5"
          }`}
        >
          <Link
            href="/branding/mainpage"
            className="group flex min-h-11 items-center gap-2"
          >
            <Image
              src="/nestlogo.webp"
              alt="Nest UI logo"
              width={600}
              height={580}
              sizes="24px"
              className="h-6 w-6 object-contain transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-110"
              priority
            />
            {/* Flat cream. This was a green→emerald gradient clipped to the
                glyphs on a brand-green bar — green on green, under 2:1, and
                visibly clipped mid-word in render. */}
            <span className="text-sm font-semibold tracking-wide text-brand-cream">
              NEST UI
            </span>
          </Link>
        </motion.div>

        {/* ---- Right pill: navigation + account ---- */}
        <motion.div
          layout="position"
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          // Ring declared per-branch, not in the base — see the note on the
          // left pill for why.
          // Tighter horizontal padding below sm. The hamburger went from 32px
          // to a legal 44px box, and at 360px the two pills were already
          // spanning x=16→344 of 360 — this is where the 12px comes from.
          className={`relative flex h-12 items-center gap-1.5 border py-0 pl-3 pr-1.5 [@media(max-height:500px)]:h-10 transition-[background-color,border-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:gap-2 sm:pl-4 sm:pr-2 ${
            scrolled
              ? "rounded-l-none rounded-r-full border-l-0 border-white/20 bg-brand-green shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]"
              : "rounded-full border-white/15 bg-brand-green/80 shadow-lg shadow-black/10 ring-1 ring-white/5"
          }`}
        >
          {/* Fallback is the same markup minus the active pill, so the swap is
              invisible and costs no layout shift. */}
          <Suspense fallback={<NavList variant="desktop" pathname={null} />}>
            <ActiveNavList variant="desktop" />
          </Suspense>

          {/* One CTA for both breakpoints. `group` + an overflow-hidden sheen
              span gives a light sweep on hover; the arrow (logged out) and the
              dashboard glyph (logged in) are the only per-state differences. */}
          <Link
            href={isLoggedIn ? "/protected" : "/auth/login"}
            // min-h-9 on mobile, not min-h-11: at 44px the chip filled the
            // 48px pill top to bottom and read as a second bar rather than a
            // button. 36px leaves 6px of breathing room each side.
            // ponytail: 36px is under the 44px touch ideal, accepted here
            // because the target is ~90px wide and isolated — the hamburger
            // beside it (the easiest thing to mis-tap) is a full 44.
            className={`group relative inline-flex min-h-9 items-center gap-1.5 overflow-hidden rounded-full px-3 py-1 text-xs font-semibold text-brand-teal shadow-sm ring-1 ring-black/5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 sm:min-h-11 sm:px-5 sm:py-1.5 sm:text-sm ${
              isLoggedIn
                ? "bg-gradient-to-r from-brand-lime to-brand-cream hover:shadow-lg hover:shadow-brand-lime/40"
                : "bg-brand-cream hover:shadow-lg hover:shadow-brand-lime/25"
            }`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-[600ms] ease-out group-hover:translate-x-[120%]"
            />
            {isLoggedIn && <LayoutDashboard className="relative h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            {/* "Login Now" → "Login" below sm. The label is the cheapest 35px
                to give back, and it's the reason a 44px hamburger fits at 360. */}
            <span className="relative">
              {isLoggedIn ? "Dashboard" : "Login"}
              {!isLoggedIn && <span className="hidden sm:inline"> Now</span>}
            </span>
            {!isLoggedIn && (
              <ArrowRight className="relative h-3.5 w-3.5 -mr-0.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
            )}
          </Link>

          {/* Desktop only — on mobile logout lives in the sheet so the pill
              stays a clean [CTA] [menu] pair instead of cramming three chips. */}
          {isLoggedIn && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Log out"
              title="Log out"
              className="tap-icon hidden rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-red-300 md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-sheet"
            className="tap-icon rounded-full text-white/90 transition-colors hover:bg-white/10 active:bg-white/15 md:hidden"
          >
            {/* No open/close icon swap any more: the sheet is a modal, so when
                it's open this button is behind the backdrop and unreachable.
                Closing is the sheet's own X. */}
            <Menu className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.nav>

      {/* THE MOBILE NAV SHEET.
          Bottom sheet, not a 256px dropdown pinned to the top-right corner:
          the bottom of the screen is the half a thumb can actually reach, and
          full-bleed rows let each link be 56px instead of 40.
          A click lands on the <dialog> itself only when it hits the backdrop —
          the panel below covers everything else. Same trick as PopUpTemplate. */}
      <dialog
        id="mobile-nav-sheet"
        ref={sheetRef}
        aria-label="Site navigation"
        onClose={() => setMenuOpen(false)}
        onClick={(e) => {
          if (e.target === sheetRef.current) setMenuOpen(false);
        }}
        // The UA stylesheet centres a modal dialog and caps it at
        // `calc(100% - 6px - 2em)`; all three overrides below are needed to
        // pin it full-bleed to the bottom edge instead.
        // max-h in dvh + overflow so it still works in landscape (390px tall).
        className="sheet fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[1.75rem] border-t border-white/10 bg-brand-green p-0 text-white shadow-2xl shadow-black/60 md:hidden"
      >
        {/* pb from the safe-area inset, so the last row clears the iOS home
            indicator instead of sitting under it. */}
        <div className="flex flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mb-1 flex items-center justify-between">
            {/* Grab handle. Purely an affordance that this panel came from the
                bottom edge — no drag is wired up, tap the backdrop or the X. */}
            <span aria-hidden className="h-1 w-10 rounded-full bg-white/20" />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="tap-icon -mr-2 rounded-full text-white/70 transition-colors active:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <Suspense
              fallback={<NavList variant="mobile" pathname={null} onNavigate={() => setMenuOpen(false)} />}
            >
              <ActiveNavList variant="mobile" onNavigate={() => setMenuOpen(false)} />
            </Suspense>
          </div>

          {isLoggedIn && (
            <div className="mt-2 border-t border-white/10 pt-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-3 text-base font-semibold text-white/80 transition-colors active:bg-red-500/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-white/60">
                  <LogOut className="h-5 w-5" />
                </span>
                Log out
              </button>
            </div>
          )}
        </div>
      </dialog>

      <PopUpTemplate
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log Out?"
        content="You'll need to log in again to reach your team dashboard and submissions. Your registration stays safe."
      >
        <button
          onClick={() => setShowLogoutConfirm(false)}
          className="btn-ghost px-6 py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={confirmLogout}
          className="btn-brand px-6 py-2.5 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </PopUpTemplate>
    </motion.header>
  );
}
