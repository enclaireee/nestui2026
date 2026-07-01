"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeRight, fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

export function Vision() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="flex w-full justify-center pt-12 pb-24 sm:pt-16 sm:pb-32"
    >
      <div className="flex w-full max-w-4xl flex-col items-center gap-4 sm:flex-row sm:gap-12">
        <motion.div variants={fadeRight}>
          <Image
            src="/nestlogo.webp"
            alt="Nest UI logo"
            width={320}
            height={320}
            className="h-44 w-44 shrink-0 object-contain sm:h-60 sm:w-60"
          />
        </motion.div>
        <div className="flex flex-1 flex-col">
          <motion.h2
            variants={fadeUp}
            className="bg-clip-text text-center text-4xl font-bold tracking-wide text-transparent sm:text-left sm:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgb(var(--brand-cream)) 0%, rgb(var(--brand-lime-soft)) 100%)",
            }}
          >
            OUR VISION
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-justify text-base font-semibold leading-loose text-white sm:text-lg"
          >
            Menjadi wadah kompetisi nasional yang mendorong lahirnya inovasi
            teknologi kesehatan yang inklusif, kolaboratif, dan berdampak melalui
            sinergi multidisiplin dalam menjawab tantangan masa depan.
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
