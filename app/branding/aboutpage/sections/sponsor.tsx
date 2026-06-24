"use client";

import { color, motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

export function Sponsors() {
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
          className="text-center text-5xl font-bold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent"
        >
          OUR PARTNERS 
        </motion.h2>
        

        <motion.div
          variants={fadeUp}
          className = "mt-12 grid grid-cols-3 gap-8"
        >
          <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
          <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
          <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
          
        </motion.div>

      </div>
    </motion.section>
  );
}