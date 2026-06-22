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
      className="flex w-full flex-col items-center pt-10 pb-12 sm:pt-14 sm:pb-16"
    >
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
        National Electrical Summit (NEST) UI 2026 hadir sebagai wadah kolaborasi
        dan inovasi yang mempertemukan teknologi, kesehatan, dan generasi muda
        untuk membentuk masa depan healthcare yang lebih cerdas, inklusif, dan
        berkelanjutan. Dengan mengusung tema{" "}
        <span className="italic">
          &ldquo;Shaping the Future of Healthcare Through Intelligent and
          Inclusive Innovation,&rdquo;
        </span>{" "}
        NEST UI 2026 mendorong lahirnya solusi berdampak melalui integrasi
        berbagai disiplin ilmu dan pemanfaatan teknologi untuk menjawab tantangan
        kesehatan masyarakat masa kini maupun masa depan.
      </motion.p>
    </motion.section>
  );
}
