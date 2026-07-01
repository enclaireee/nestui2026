"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

const MISSIONS = [
  "Menyediakan platform kompetitif bagi siswa dan mahasiswa untuk mengembangkan solusi inovatif di bidang healthcare technology berbasis keilmuan Teknik Elektro, Teknik Komputer, dan Teknik Biomedik.",
  "Memperkenalkan dan merepresentasikan keberagaman fokus keilmuan di Departemen Teknik Elektro melalui rangkaian kegiatan yang edukatif, inspiratif, dan berdampak.",
  "Mendorong kolaborasi multidisiplin dan pertukaran gagasan untuk menghasilkan inovasi yang relevan, adaptif, dan berorientasi pada kebutuhan masyarakat.",
  "Meningkatkan kesadaran akan pentingnya teknologi yang inklusif, mudah diakses, dan memberikan manfaat nyata bagi kualitas hidup manusia.",
  "Menciptakan iklim kerja internal yang efektif, disiplin, dan harmonis.",
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
