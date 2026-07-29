"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

interface StepIndicatorProps {
  currentStep: number;
  className?: string;
}

/**
 * Real intrinsic dimensions, per step. These are NOT interchangeable: step 1 is
 * 998x1265 and steps 2-4 are 998x1814, so the single `600x600` this used to
 * declare was wrong for all four. next/image reserves the box from these
 * numbers before the file arrives, so a wrong ratio means the rail jumps to a
 * different height the moment the art loads.
 */
const STEP_ART = {
  1: { src: "/regsteps1.webp", width: 998, height: 1265 },
  2: { src: "/regsteps2.webp", width: 998, height: 1814 },
  3: { src: "/regsteps3.webp", width: 998, height: 1814 },
  4: { src: "/regsteps4.webp", width: 998, height: 1814 },
} as const;

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const stepNumber = Math.min(currentStep + 1, 4) as keyof typeof STEP_ART;
  const art = STEP_ART[stepNumber];

  return (
    <div className={cn("relative flex items-center justify-center md:justify-end w-full", className)}>
      {/* popLayout so the outgoing artwork doesn't reserve a second row while
          both are on screen. initial={false} keeps first paint animation-free —
          the wizard card next to it already carries the entry. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={stepNumber}
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -14 }}
          transition={{ duration: 0.45, ease }}
        >
          <Image
            src={art.src}
            alt={`Step ${stepNumber} Indicator`}
            width={art.width}
            height={art.height}
            // Rendered only from md up (the rail is display:none below it), so
            // phones never fetch these 209-278KB files at all.
            sizes="(min-width: 1024px) 600px, 500px"
            className="w-[500px] lg:w-[600px] h-auto object-contain drop-shadow-lg"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}