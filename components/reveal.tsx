"use client";

import { motion } from "framer-motion";
import { duration, ease, inViewOnce, offset, rest } from "@/lib/motion";

/**
 * Scroll-triggered entry animation for a single element.
 *
 * Exists so server components can animate without becoming client components:
 * the children are passed through as a prop and stay server-rendered. Use the
 * `staggerContainer` / `fadeUp` variants from lib/motion instead when the
 * parent is already a client component and you want real stagger.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before starting. Index * 0.08 gives a list a nice cascade. */
  delay?: number;
  from?: keyof typeof offset;
  as?: "div" | "section" | "header" | "li";
}) {
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset[from] }}
      whileInView={rest}
      viewport={inViewOnce}
      transition={{ duration, ease, delay }}
    >
      {children}
    </MotionTag>
  );
}
