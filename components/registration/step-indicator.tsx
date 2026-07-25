"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

interface StepIndicatorProps {
  currentStep: number;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const stepNumber = Math.min(currentStep + 1, 4);
  const imageSrc = `/regsteps${stepNumber}.webp`;

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
            src={imageSrc}
            alt={`Step ${stepNumber} Indicator`}
            width={600}
            height={600}
            priority
            className="w-72 sm:w-96 md:w-[500px] lg:w-[600px] h-auto object-contain drop-shadow-lg"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}