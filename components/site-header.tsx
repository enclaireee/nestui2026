"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PopUpTemplate } from "@/components/registration/pop-up-template";

const navLinks = [
  { label: "Home", href: "/branding/mainpage" },
  { label: "About us", href: "/branding/aboutpage" },
  { label: "Registration", href: "/branding/registration" },
];

// Close the enclosing <details> menu (uncontrolled, no state needed).
function closeMenu(e: MouseEvent<HTMLElement>) {
  e.currentTarget.closest("details")?.removeAttribute("open");
}

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

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
      <nav className="relative mx-auto flex h-12 max-w-4xl items-center justify-between rounded-full border border-white/15 bg-[#0C342C]/80 pl-4 pr-2 shadow-lg shadow-black/10 ring-1 ring-white/5 sm:pl-5">
        <Link href="/branding/mainpage" className="flex items-center gap-2">
          <Image
            src="/nestlogo.webp"
            alt="Nest UI logo"
            width={32}
            height={32}
            className="h-6 w-6 object-contain"
            priority
          />
          <span
            className="bg-clip-text text-sm font-semibold tracking-wide text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(60deg, #0C342C 0%, #009477 22%, #009477 78%, #0C342C 100%)",
            }}
          >
            NEST UI
          </span>
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 transition-colors hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={isLoggedIn ? "/protected" : "/auth/login"}
            className={
              isLoggedIn
                ? "flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-lime to-brand-cream px-5 py-1.5 text-sm font-semibold text-brand-teal shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
                : "rounded-full bg-white/95 px-5 py-1.5 text-sm font-semibold text-[#0C342C] shadow-sm transition-colors hover:bg-white"
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

          {/* Mobile menu — native <details> disclosure, no JS state */}
          <details className="group md:hidden">
            <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" className="group-open:hidden" />
                <line x1="4" y1="12" x2="20" y2="12" className="group-open:hidden" />
                <line x1="4" y1="17" x2="20" y2="17" className="group-open:hidden" />
                <line x1="6" y1="6" x2="18" y2="18" className="hidden group-open:block" />
                <line x1="18" y1="6" x2="6" y2="18" className="hidden group-open:block" />
              </svg>
            </summary>
            {/* Click-away backdrop: closes the menu on any tap outside it */}
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div className="absolute right-2 top-[calc(100%+0.6rem)] z-50 flex w-48 flex-col rounded-2xl border border-white/15 bg-[#0C342C]/95 p-2 shadow-lg ring-1 ring-white/5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-emerald-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </nav>

      <PopUpTemplate
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log Out?"
        content="Are you sure you want to log out?"
      >
        <button
          onClick={() => setShowLogoutConfirm(false)}
          className="rounded-xl border-2 border-brand-lime px-8 py-2.5 text-sm font-bold tracking-wide text-brand-lime transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-brand-lime/10"
        >
          Cancel
        </button>
        <button
          onClick={confirmLogout}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-8 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </PopUpTemplate>
    </motion.header>
  );
}
