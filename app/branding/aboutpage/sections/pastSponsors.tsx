"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

// ponytail: hardcoded list, filenames are static assets. "Sponso11" is the actual file name.
const logos = [
  "Sponsor1.png", "Sponsor2.png", "Sponsor3.png", "Sponsor4.png", "Sponsor5.png",
  "Sponsor6.png", "Sponsor7.png", "Sponsor8.png", "Sponsor9.png", "Sponsor10.png",
  "Sponso11.png", "Sponsor12.png", "Sponsor13.png", "Sponsor14.png",
];

export function PastSponsors() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="flex w-full justify-center py-14 sm:py-24"
    >
      <div className="w-full max-w-6xl">

        <motion.p
          variants={fadeUp}
          className="text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400/80"
        >
          Trusted by {logos.length}+ partners
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="mt-3 text-center text-3xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent"
        >
          Past Sponsors
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-center text-sm sm:text-base leading-relaxed text-white/70"
        >
          Organisations that backed NEST UI and helped bring healthcare innovation
          to the national stage.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 sm:mt-14 rounded-3xl border border-white/10 bg-white/[0.07] p-4 sm:p-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {logos.map((src) => (
              <div
                key={src}
                className="group flex h-24 sm:h-32 items-center justify-center rounded-2xl bg-white/90 ring-1 ring-white/20 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:ring-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/10"
              >
                <Image
                  src={`/pastsponsors/${src}`}
                  alt="Past sponsor logo"
                  width={220}
                  height={128}
                  className="max-h-full w-auto object-contain p-4 sm:p-6 opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
