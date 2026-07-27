"use client";

import { motion } from "framer-motion";
import { fadeLeft, fadeRight, fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

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
      className="flex w-full flex-col pt-8 pb-14 sm:pt-16 sm:pb-32"
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

      <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-6">
        {MISSIONS.map((text, i) => (
          // Alternating entry sides turn five identical pills into a weave.
          <motion.div key={i} variants={i % 2 ? fadeLeft : fadeRight} className="flex items-stretch">
            {/* Gradient pill — misicontainer image (its left cap is the circle).
                `min-h-24`, not `h-24`: at a fixed 96px the longest three
                missions overflowed their own pill by 7–14px and the copy
                floated outside the artwork. bg-[length:100%_100%] already
                stretches the image, so letting the box grow just works. */}
            <div className="flex min-h-24 flex-1 items-center rounded-[2.5rem] bg-[url('/misicontainerMobile.webp')] bg-[length:100%_100%] bg-center bg-no-repeat py-3 shadow-lg sm:min-h-28 sm:rounded-full sm:bg-[url('/misicontainer.webp')] sm:bg-cover sm:py-0">
              {/* 11px justified in a ~160px column was the only sub-12px text
                  in the app, and justification at that measure is all rivers.
                  Left-aligned 14px, with the left inset cut back to give the
                  bigger type somewhere to go. */}
              <p className="pl-24 pr-6 text-left text-sm font-semibold leading-snug text-white sm:pl-36 sm:pr-12 sm:text-base sm:text-justify">
                {text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
