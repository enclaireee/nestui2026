"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PopUpTemplate } from "@/components/registration/pop-up-template";

const navLinks = [
  { label: "Home", href: "/branding/mainpage" },
  { label: "About us", href: "/branding/aboutpage" },
  { label: "Registration", href: "/branding/registration" },
  { label: "Contact", href: "/branding/contact" },
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
    return (
      <>
        {navLinks.map((link, i) => {
          const active = pathname === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              // Cascade down the list rather than appearing as a block.
              transition={{ delay: 0.04 + i * 0.045, duration: 0.25 }}
            >
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-lime/15 text-brand-lime ring-1 ring-brand-lime/30"
                    : "text-white/90 hover:bg-white/10 hover:text-brand-lime"
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
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
            className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
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
  const router = useRouter();

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

  // The sheet closes on link tap (see onNavigate), on Escape, and on backdrop
  // click. It deliberately does NOT watch pathname to auto-close: that would
  // pull request-time data back into this component and re-break the build —
  // the reason NavList takes pathname as a prop at all.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/auth/login");
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="sticky top-0 z-50 w-full px-4 pt-3 sm:pt-4"
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
          className={`flex h-12 shrink-0 items-center border py-0 pl-4 pr-4 transition-[background-color,border-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled
              ? // Inner edge loses its radius AND its border, so the two halves
                // read as one continuous pill with no seam down the middle.
                "rounded-l-full rounded-r-none border-r-0 border-white/20 bg-brand-green shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)]"
              : "rounded-full border-white/15 bg-brand-green/80 shadow-lg shadow-black/10 ring-1 ring-white/5"
          }`}
        >
          <Link href="/branding/mainpage" className="group flex items-center gap-2">
            <Image
              src="/nestlogo.webp"
              alt="Nest UI logo"
              width={32}
              height={32}
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
          className={`relative flex h-12 items-center gap-2 border py-0 pl-4 pr-2 transition-[background-color,border-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
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

          <Link
            href={isLoggedIn ? "/protected" : "/auth/login"}
            className={
              isLoggedIn
                ? "flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-lime to-brand-cream px-5 py-1.5 text-sm font-semibold text-brand-teal shadow-sm transition-all duration-150 hover:scale-105 hover:shadow-md"
                : "rounded-full bg-white/95 px-5 py-1.5 text-sm font-semibold text-brand-teal shadow-sm transition-colors hover:bg-white"
            }
          >
            {isLoggedIn && <LayoutDashboard className="h-4 w-4" />}
            {isLoggedIn ? "Dashboard" : "Login Now"}
          </Link>

          {isLoggedIn && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Log out"
              title="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {/* Was a native <details> disclosure. Swapped for real state so the
              sheet can animate out as well as in — <details> removes its
              content the instant `open` is dropped, so an exit animation is
              impossible. This component already holds state, so it costs
              nothing extra. */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 md:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={menuOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-4 top-[calc(100%+0.6rem)] z-50 flex w-52 origin-top-right flex-col rounded-2xl border border-white/15 bg-brand-green p-2 shadow-2xl shadow-black/40 ring-1 ring-white/5 md:hidden"
            >
              <Suspense
                fallback={<NavList variant="mobile" pathname={null} onNavigate={() => setMenuOpen(false)} />}
              >
                <ActiveNavList variant="mobile" onNavigate={() => setMenuOpen(false)} />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PopUpTemplate
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log Out?"
        content="You'll need to log in again to reach your team dashboard and submissions. Your registration stays safe."
      >
        <button
          onClick={() => setShowLogoutConfirm(false)}
          className="btn-ghost px-8 py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={confirmLogout}
          className="btn-brand px-8 py-2.5 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </PopUpTemplate>
    </motion.header>
  );
}
