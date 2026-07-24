import type { Variants } from "framer-motion";

// Expo-out. Fast start, long soft settle — the curve that reads as "expensive".
export const ease = [0.16, 1, 0.3, 1] as const;
export const duration = 0.85;

/**
 * Where each entry starts from. `from` names the side the element enters from,
 * so `left` starts off to the left and travels right. Single source of truth:
 * the variants below and <Reveal> both build off this.
 */
export const offset = {
  up: { y: 32, scale: 0.98 },
  left: { x: -36 },
  right: { x: 36 },
  scale: { scale: 0.92 },
} as const;

/** The resting state every entry animates to. */
export const rest = { opacity: 1, x: 0, y: 0, scale: 1 } as const;

// ponytail: every variant below animates opacity/transform only, so each one
// stays on the compositor. Adding filter/blur or animating width/top would
// pull these onto the main thread — don't.

/** Parent: reveals children one after another when scrolled into view. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const variant = (from: keyof typeof offset): Variants => ({
  hidden: { opacity: 0, ...offset[from] },
  show: { ...rest, transition: { duration, ease } },
});

/** Child: fades and slides up into place, easing off a hair of scale. */
export const fadeUp = variant("up");

/** Child: fades and slides in from the left (for side-by-side rows). */
export const fadeRight = variant("left");

/** Child: fades and slides in from the right — mirror of fadeRight, for
 * alternating rows. */
export const fadeLeft = variant("right");

/** Sensible defaults for whileInView so it triggers a touch before fully visible. */
export const inViewOnce = { once: true, margin: "-100px" } as const;
