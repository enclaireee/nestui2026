import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "NEST UI 2026",
  description:
    "National Electrical Summit (NEST) UI 2026 — Shaping the Future of Healthcare Through Intelligent and Inclusive Innovation.",
};

// Default font for the whole app. Drop the file(s) in app/fonts/.
// We only have the Semibold file, so we tell the browser this one face
// covers the full weight range (100–900). Any font-weight (font-light,
// font-bold, etc.) will render using this file instead of breaking.
const oddval = localFont({
  variable: "--font-oddval",
  display: "swap",
  src: [
    {
      path: "./fonts/Oddval-Semibold.ttf",
      weight: "100 900",
      style: "normal",
    },
    // When you get more real weights, replace the single entry above with
    // one entry per file, e.g.:
    // { path: "./fonts/Oddval-Regular.ttf", weight: "400", style: "normal" },
    // { path: "./fonts/Oddval-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={`${oddval.variable} font-sans antialiased bg-brand-green`}
      >
        {/* AppShell reads usePathname() to pick the site chrome per route —
            that's request-bound ("uncached") data, so cacheComponents needs
            a Suspense boundary around it (same pattern as the admin layout's
            cookie-based auth check). */}
        <Suspense>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
