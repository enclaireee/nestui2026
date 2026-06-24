"use client";

import { color, motion } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";

export function PastSponsors() {
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
          Past Sponsors
        </motion.h2>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-5 gap-4"
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
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
        </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
        </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
        </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
        </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
        <div className="flex justify-center items-center h-40 rounded-xl bg-gray-200 text-black hover:scale-105 hover:shadow-lg transition-all duration-500">
            Logo Sponsor
          </div>
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