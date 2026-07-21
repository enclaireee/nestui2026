import type { ReactNode } from "react";
import Image from "next/image";

interface AuthPageShellProps {
  /** The page's ONE heading. Also the only place a title is rendered. */
  heading: string;
  /** One line under the heading saying what this page is for. */
  subheading?: string;
  children: ReactNode;
}

/**
 * Centred-minimal auth shell, modelled on Linear's and Vercel's login pages.
 *
 * What it replaces, and why:
 *
 * - TWO headings. The shell rendered a 7xl "Login" and then AuthForm rendered
 *   "Welcome Back!" directly under it — the same message twice, and the pair
 *   ate the top third of the viewport. There is now exactly one.
 * - A full-bleed `loginbg.svg` running directly behind the form. The
 *   references put nothing behind the fields at all; decoration there is what
 *   made the translucent inputs so hard to read.
 * - A 512px decorative logo lockup beside the card, which was pure filler and
 *   pushed the actual form off-centre.
 *
 * Solid brand-green is doing real work here: it's the value anchor the auth
 * pages never had, and it's what lets the fields sit at proper contrast
 * instead of white-on-bright-green at roughly 1.8:1.
 */
export function AuthPageShell({ heading, subheading, children }: AuthPageShellProps) {
  return (
    <main className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-brand-green px-5 pb-20 pt-28">
      {/* Brand backdrop, kept full-bleed. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG backdrop; next/image does not optimise SVG. */}
      <img
        src="/loginbg.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Scrim. The backdrop is a bright, high-chroma green and the fields are
          cream-on-translucent — straight over the raw SVG they measured about
          1.8:1. A light wash knocks the background back just far enough to
          read as texture behind the panel rather than as competition with it,
          without washing the brand out. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-brand-green/45" />

      {/* ~380px content column, matching the references — a login form does
          not get wider just because the screen does.

          The panel is back, and it earns its place now in a way it didn't
          before: with a busy backdrop behind the form again, the fields need
          their own dark surface to sit on. On a flat colour it was just a box
          drawn around nothing. */}
      <div className="w-full max-w-[380px] rounded-2xl border border-brand-cream/12 bg-brand-green/95 p-7 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/nestlogo.webp"
            alt="Nest UI 2026"
            width={64}
            height={64}
            priority
            className="h-11 w-11 object-contain"
          />
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-cream">
            {heading}
          </h1>
          {subheading && (
            <p className="mt-2 text-sm leading-relaxed text-brand-cream/55">
              {subheading}
            </p>
          )}
        </div>

        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}
