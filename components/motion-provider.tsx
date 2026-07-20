"use client";

import { MotionConfig } from "framer-motion";

/**
 * Honors the OS "reduce motion" setting app-wide: framer-motion drops the
 * transform/layout part of every animation and keeps only opacity.
 *
 * Children are passed through as a prop, so they stay server components —
 * see the note in site-chrome.tsx about not turning layouts into client ones.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
