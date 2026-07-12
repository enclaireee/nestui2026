"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealFooter } from "@/components/reveal-footer";

// ponytail: auth pages opt out of the sticky reveal-footer trick and get a
// normal in-flow footer instead — simplest way to special-case one route
// family without duplicating the root layout.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");

  // Admin has its own header/background — no site chrome at all here.
  if (isAdminPage) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="-mt-[60px] flex-1 sm:-mt-16">{children}</div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 bg-brand-green">
        <SiteHeader />
        <div className="-mt-[60px] sm:-mt-16">{children}</div>
      </div>
      <RevealFooter />
    </>
  );
}
