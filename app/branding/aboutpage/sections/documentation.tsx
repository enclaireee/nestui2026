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
      className="flex w-full justify-center py-14 sm:py-24"
    >
      <div className="w-full max-w-6xl">
        <motion.h2
          variants={fadeUp}
          className="text-center text-3xl sm:text-5xl font-bold bg-gradient-to-r from-brand-lime to-brand-cream bg-clip-text text-transparent mb-8 sm:mb-12"
        >
          Dokumentasi
        </motion.h2>

        <motion.div
          variants={fadeUp}
          className="overflow-hidden"
          style={{
            // Fade the cards into transparency at both edges.
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          {/* Track is the slides rendered twice; animating it -50% loops
              seamlessly. Pauses on hover so a photo can actually be looked at. */}
          <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
            {[...SLIDES, ...SLIDES].map((src, i) => (
              <div
                key={i}
                className="h-40 w-64 sm:h-48 sm:w-80 shrink-0 rounded-xl p-[2px]"
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
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
