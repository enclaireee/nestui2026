import type { Metadata } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion-provider";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const title = "NEST UI 2026 — National Electrical Summit";
const description =
  "National Electrical Summit (NEST) UI 2026 — Shaping the Future of Healthcare Through Intelligent and Inclusive Innovation. Join MedHack, Healthineer, and Healthynovation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s · NEST UI 2026" },
  description,
  applicationName: "NEST UI 2026",
  keywords: [
    "NEST UI 2026",
    "National Electrical Summit",
    "Universitas Indonesia",
    "MedHack",
    "Healthineer",
    "Healthynovation",
    "healthcare innovation",
    "biomedical competition",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "NEST UI 2026",
    title,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
