// No "use client", no framer-motion. This section is above the fold and holds
// the page's LCP element, and every part of the animation it used to have was
// working against that:
//
//   - `initial="hidden"` starts the wrapper at opacity 0, and framer doesn't
//     resolve it until hydration. On a 4x-throttled CPU that measured as
//     FCP 732ms but **LCP 4436ms** — the largest text on the page sat
//     invisible for 3.7s after first paint, while already being in the HTML.
//   - Chrome skips fully-transparent elements when picking an LCP candidate,
//     so the fade didn't just delay the paint, it moved the metric.
//
// Same reasoning as the hero's `.hero-rise` in globals.css: entry animation
// above the fold is CSS and transform-only, or it isn't there at all. Below
// the fold, `whileInView` is still fine — Vision/Mission/Sponsors keep theirs.
import Image from "next/image";

export function Description() {
  return (
    <section className="flex w-full flex-col items-center pt-16 pb-10 sm:pt-24 sm:pb-16">
      {/* Mobile-only glass container to make the hero stand out; transparent on desktop */}
      <div className="flex w-full max-w-4xl flex-col items-center rounded-3xl border border-white/15 bg-white/[0.12] px-4 py-5 shadow-xl sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
        <div className="hero-rise w-full max-w-4xl">
          <Image
            src="/aboutheronest.webp"
            alt="NEST UI 2026"
            width={2769}
            height={576}
            priority
            // Was serving the 3840w candidate to a 308px slot.
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full"
          />
        </div>

        <p
          className="hero-rise mt-5 max-w-4xl text-center text-base font-semibold leading-relaxed text-white sm:mt-8 sm:text-lg sm:leading-loose"
          style={{ animationDelay: "120ms" }}
        >
          National Electrical Summit (NEST) UI 2026 is a platform for
          collaboration and innovation that brings together technology, health,
          and the younger generation to shape a smarter, more inclusive, and
          sustainable future of healthcare. Under the theme{" "}
          <span className="italic">
            &ldquo;Shaping the Future of Healthcare Through Intelligent and
            Inclusive Innovation,&rdquo;
          </span>{" "}
          NEST UI 2026 drives the emergence of impactful solutions through the
          integration of various disciplines and the use of technology to
          address both present and future public health challenges.
        </p>
      </div>
    </section>
  );
}
