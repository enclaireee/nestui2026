import type { Config } from "tailwindcss";

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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
