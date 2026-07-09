"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const stepNumber = Math.min(currentStep + 1, 4);
  const imageSrc = `/regsteps${stepNumber}.webp`;

  return (
    <div className={cn("relative flex items-center justify-center md:justify-end w-full", className)}>
      <Image
        src={imageSrc}
        alt={`Step ${stepNumber} Indicator`}
        className="w-48 sm:w-64 md:w-80 h-auto object-contain drop-shadow-lg"
      />
    </div>
  );
}
