"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

export function Description() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="flex w-full flex-col items-center pt-20 pb-12 sm:pt-24 sm:pb-16"
    >
      {/* Mobile-only glass container to make the hero stand out; transparent on desktop */}
      <div className="flex w-full max-w-4xl flex-col items-center rounded-3xl border border-white/15 bg-white/10 px-5 py-6 shadow-xl backdrop-blur-md sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none">
      <motion.div variants={fadeUp} className="w-full max-w-4xl">
        <Image
          src="/aboutheronest.webp"
          alt="NEST UI 2026"
          width={2769}
          height={576}
          priority
          className="h-auto w-full"
        />
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="mt-6 max-w-4xl text-center text-base font-semibold leading-loose text-white sm:mt-8 sm:text-lg"
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
      </motion.p>
      </div>
    </motion.section>
  );
}
