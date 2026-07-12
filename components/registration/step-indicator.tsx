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
        width={600}
        height={600}
        priority
        className="w-72 sm:w-96 md:w-[500px] lg:w-[600px] h-auto object-contain drop-shadow-lg"
      />
    </div>
  );
}