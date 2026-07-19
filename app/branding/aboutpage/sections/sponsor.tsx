"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

export function Sponsors() {
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
          className="text-center text-3xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent"
        >
          OUR PARTNERS
        </motion.h2>

        <motion.div
          variants={fadeUp}
          className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-center items-center h-28 sm:h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-200">
              Logo Sponsor
            </div>
          ))}
        </motion.div>

      </div>
    </motion.section>
  );
}