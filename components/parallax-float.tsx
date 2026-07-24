"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-linked drift for decorative floaters. As the element travels through
 * the viewport it slides `distance`px against the scroll direction, which
 * separates the decoration from the page plane and reads as depth.
 *
 * Children are passed through as a prop so server-rendered <Image>s stay
 * server-rendered — same pattern as MotionProvider.
 *
 * PERF: `y` is a MotionValue bound straight into style, so scrolling never
 * re-renders this component; framer writes the transform on the compositor
 * thread's schedule. Keep this wrapper transform-only — no filter, no layout
 * props.
 */
export function ParallaxFloat({
  children,
  className,
  distance = 60,
}: {
  children: React.ReactNode;
  className?: string;
  /** Total px of drift across the element's trip through the viewport. */
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance * 0.5, -distance * 0.5]);
  // MotionConfig reducedMotion covers animations, not style bindings — this
  // scroll link is a binding, so it needs its own reduced-motion opt-out.
  const reduced = useReducedMotion();

  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
