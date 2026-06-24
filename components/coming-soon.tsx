"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, staggerContainer } from "@/lib/motion";

type ComingSoonProps = {
  /** Small uppercase label above the headline, e.g. the section name. */
  label?: string;
};

export function ComingSoon({ label = "Registration" }: ComingSoonProps) {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-[#0C342C] bg-top bg-no-repeat bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/aboutbackground.webp')" }}
    >
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="flex-1 w-full max-w-5xl flex flex-col justify-center px-6 py-28 sm:py-40">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-2xl"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {label}
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-5xl font-bold leading-[1.05] text-white sm:text-7xl"
              >
                Not open
                <br />
                just yet.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-white/90"
              >
                We&apos;re still building the registration flow for{" "}
                <span className="text-emerald-300">
                  National Electrical Summit 2026
                </span>
                . It opens alongside the full schedule. Leave your email and
                we&apos;ll make sure you&apos;re the first to know.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <Link
                  href="mailto:nestui.ft@gmail.com?subject=Notify%20me%20about%20NEST%20UI%202026%20registration"
                  className="inline-flex w-fit items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#0C342C] transition-colors hover:bg-emerald-50"
                >
                  Notify me
                </Link>
                <Link
                  href="/branding/aboutpage"
                  className="text-sm font-semibold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Read about NEST UI 2026
                </Link>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-16 border-t border-white/15 pt-5 text-xs font-medium uppercase tracking-widest text-white/50"
              >
                Opening Soon · Universitas Indonesia
              </motion.p>
            </motion.div>
          </div>
        </div>
      </main>
  );
}
