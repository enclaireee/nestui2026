"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export function Dokumentasi() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 2500 })]);

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="flex w-full justify-center py-24"
    >
      <div className="w-full max-w-6xl">

        <motion.h2
          variants={fadeUp}
          className="text-center text-5xl font-bold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent mb-12"
        >
          Dokumentasi
        </motion.h2>

        <motion.div variants={fadeUp}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">

              <div className="flex-none w-1/3 pl-4 h-48">
                <div className="h-full rounded-xl p-[2px]" style={{ background: "linear-gradient(to right, #9eb91c70, #c8ce14dd)" }}>
                  <div className="h-full w-full rounded-xl bg-gray-200" />
                </div>
              </div>

              <div className="flex-none w-1/3 pl-4 h-48">
                <div className="h-full rounded-xl p-[2px]" style={{ background: "linear-gradient(to right, #9eb91c70, #c8ce14dd)" }}>
                  <div className="h-full w-full rounded-xl bg-gray-200" />
                </div>
              </div>

              <div className="flex-none w-1/3 pl-4 h-48">
                <div className="h-full rounded-xl p-[2px]" style={{ background: "linear-gradient(to right, #9eb91c70, #c8ce14dd)" }}>
                  <div className="h-full w-full rounded-xl bg-gray-200" />
                </div>
              </div>

              <div className="flex-none w-1/3 pl-4 h-48">
                <div className="h-full rounded-xl p-[2px]" style={{ background: "linear-gradient(to right, #9eb91c70, #c8ce14dd)" }}>
                  <div className="h-full w-full rounded-xl bg-gray-200" />
                </div>
              </div>


            </div>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}