"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

const MISSIONS = [
  "Providing a competitive platform for highschool and university students to develop innovative solutions in healthcare technology, grounded in Electrical Engineering, Computer Engineering, and Biomedical Engineering.",
  "Introducing and representing the diversity of academic focuses within the Department of Electrical Engineering through a series of educational, inspiring, and impactful activities.",
  "Encouraging multidisciplinary collaboration and the exchange of ideas to produce innovation that is relevant, adaptive, and oriented toward the needs of society.",
  "Raising awareness of the importance of inclusive, accessible technology that delivers real benefits to human quality of life.",
  "Creating an internal working environment that is effective, disciplined, and harmonious.",
];

export function Mission() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="flex w-full flex-col pt-12 pb-24 sm:pt-16 sm:pb-32"
    >
      <motion.h2
        variants={fadeUp}
        className="bg-clip-text text-center text-4xl font-bold tracking-wide text-transparent sm:text-left sm:text-5xl"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgb(var(--brand-cream)) 0%, rgb(var(--brand-lime-soft)) 100%)",
        }}
      >
        THE MISSION
      </motion.h2>

      <div className="mt-8 flex flex-col gap-5 sm:gap-6">
        {MISSIONS.map((text, i) => (
          <motion.div key={i} variants={fadeUp} className="flex items-stretch">
            {/* Gradient pill — misicontainer image (its left cap is the circle), same height for all.
                Mobile stretches the image; desktop covers. */}
            <div className="flex h-24 flex-1 items-center rounded-full bg-[url('/misicontainerMobile.webp')] bg-[length:100%_100%] bg-center bg-no-repeat shadow-lg sm:h-28 sm:bg-[url('/misicontainer.webp')] sm:bg-cover">
              <p className="pl-28 pr-12 text-justify text-[11px] font-semibold leading-tight text-white sm:pl-36 sm:pr-12 sm:text-base sm:leading-snug">
                {text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
