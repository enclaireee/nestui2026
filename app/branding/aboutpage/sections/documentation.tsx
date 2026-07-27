"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

const SLIDES = ["/dokumnest1.jpg", "/dokumnest2.jpg", "/dokumnest3.jpg"];

export function Dokumentasi() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="flex w-full justify-center py-10 sm:py-24"
    >
      <div className="w-full max-w-6xl">
        <motion.h2
          variants={fadeUp}
          className="text-center text-3xl sm:text-5xl font-bold bg-gradient-to-r from-brand-lime to-brand-cream bg-clip-text text-transparent mb-8 sm:mb-12"
        >
          Dokumentasi
        </motion.h2>

        {/* Was an infinite CSS marquee whose ONLY pause was `hover:` — which
            on a touch device means the photos slide past and can never be
            looked at. A native scroll-snap row is swipeable, gets momentum
            scrolling for free, respects reduced-motion by simply not moving,
            and deletes both the duplicated track and the keyframes. */}
        <motion.div
          variants={fadeUp}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
          style={{
            // Fade the cards into transparency at both edges.
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          {SLIDES.map((src) => (
            <div
              key={src}
              className="h-40 w-64 shrink-0 snap-center rounded-xl p-[2px] sm:h-48 sm:w-80"
              style={{
                background:
                  "linear-gradient(to right, rgb(var(--brand-lime-bright) / 0.44), rgb(var(--brand-lime) / 0.87))",
              }}
            >
              <Image
                src={src}
                alt=""
                width={320}
                height={192}
                sizes="(min-width: 640px) 320px, 256px"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          ))}
        </motion.div>
        <p className="mt-3 text-center text-xs text-white/55 sm:hidden">Swipe to see more →</p>
      </div>
    </motion.section>
  );
}
