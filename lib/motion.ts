import type { Variants } from "framer-motion";

// Shared easing for a smooth, natural feel.
const ease = [0.21, 0.47, 0.32, 0.98] as const;

/** Parent: reveals children one after another when scrolled into view. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Child: fades and slides up into place. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

/** Child: fades and slides in from the left (for side-by-side rows). */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease },
  },
};

/** Sensible defaults for whileInView so it triggers a touch before fully visible. */
export const inViewOnce = { once: true, margin: "-100px" } as const;
