import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Default font: anything using `font-sans` (and the base body) gets Oddval.
        sans: ["var(--font-oddval)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Use the `font-geller` utility class to opt into Geller.
        geller: ["var(--font-geller)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand palette — values live in app/globals.css as RGB channels.
        brand: {
          green: "rgb(var(--brand-green) / <alpha-value>)",
          teal: "rgb(var(--brand-teal) / <alpha-value>)",
          "teal-mid": "rgb(var(--brand-teal-mid) / <alpha-value>)",
          emerald: "rgb(var(--brand-emerald) / <alpha-value>)",
          "emerald-bright": "rgb(var(--brand-emerald-bright) / <alpha-value>)",
          lime: "rgb(var(--brand-lime) / <alpha-value>)",
          "lime-bright": "rgb(var(--brand-lime-bright) / <alpha-value>)",
          "lime-soft": "rgb(var(--brand-lime-soft) / <alpha-value>)",
          cream: "rgb(var(--brand-cream) / <alpha-value>)",
          butter: "rgb(var(--brand-butter) / <alpha-value>)",
          "butter-soft": "rgb(var(--brand-butter-soft) / <alpha-value>)",
        },
        // The rest of the shadcn palette went with components/ui — nothing
        // referenced card/popover/primary/secondary/muted/accent/destructive/
        // chart. These two stay because globals.css's base layer uses them.
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 20s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
