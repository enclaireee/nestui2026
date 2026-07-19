import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealFooter } from "@/components/reveal-footer";

/**
 * Site chrome, picked per route subtree by a layout instead of by a client
 * component reading usePathname().
 *
 * The old AppShell did the latter, which under `cacheComponents` made the
 * pathname request-time data — so the Suspense boundary wrapping it (and
 * therefore every page in the app) bailed out to client-side rendering and
 * shipped an empty <body>. These are plain server components, so pages
 * prerender to real HTML again.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative z-10 bg-brand-green">
        <SiteHeader />
        {/* Pull content up under the floating (sticky, transparent) header. */}
        <div className="-mt-[60px] sm:-mt-16">{children}</div>
      </div>
      <RevealFooter />
    </>
  );
}

/**
 * Auth pages opt out of the sticky reveal-footer trick — their cards are
 * vertically centred, so a footer that only appears at the very bottom of a
 * tall scroll would never be reachable.
 */
export function AuthChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="-mt-[60px] flex-1 sm:-mt-16">{children}</div>
      <SiteFooter />
    </div>
  );
}
