import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthPageShellProps {
  heading: string;
  children: ReactNode;
  /** Login/Sign up show the big logo lockup beside the card; forgot/reset password don't. */
  showLogo?: boolean;
}

export function AuthPageShell({ heading, children, showLogo = false }: AuthPageShellProps) {
  return (
    <main className="relative isolate flex min-h-screen w-full flex-col items-center overflow-x-hidden pt-28 pb-16">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG backdrop; next/image does not optimise SVG. */}
      <img
        src="/loginbg.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* inline line-height: the sm/md text-size utilities each bundle their
          own line-height:1, which outranks a plain `leading-*` class at
          those breakpoints (later in the cascade) and re-clips the glyphs. */}
      <h1
        className="relative z-10 px-4 text-center text-5xl font-bold text-gradient-brand drop-shadow-md sm:text-6xl md:text-7xl"
        style={{ lineHeight: 1.4 }}
      >
        {heading}
      </h1>

      <div
        className={cn(
          "relative z-10 mt-10 flex w-full max-w-6xl flex-1 items-center justify-center gap-12 px-4 md:px-8 lg:gap-16",
          showLogo && "md:justify-between"
        )}
      >
        {showLogo && (
          <Image
            src="/loginlogo.webp"
            alt="Nest UI 2026"
            width={1280}
            height={658}
            sizes="(min-width: 1024px) 512px, (min-width: 768px) 448px, 0px"
            className="hidden h-auto w-full max-w-md md:block lg:max-w-lg"
          />
        )}
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">{children}</div>
      </div>
    </main>
  );
}
