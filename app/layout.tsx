import type { Metadata, Viewport } from "next";
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

// `viewportFit: "cover"` is not cosmetic — without it iOS reports every
// env(safe-area-inset-*) as 0px, so the footer's links sit under the home
// indicator and no amount of CSS can move them. Next's default viewport tag
// omits it, which is why the whole app had zero safe-area handling.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Default font for the whole app. Drop the file(s) in app/fonts/.
// We only have the Semibold file, so we tell the browser this one face
// covers the full weight range (100–900). Any font-weight (font-light,
// font-bold, etc.) will render using this file instead of breaking.
const oddval = localFont({
  variable: "--font-oddval",
  display: "swap",
  // WOFF2, not the raw TTF. The TTF was 231KB on disk and 94KB over the wire
  // (gzip), and took 2.0–2.3s to arrive on Slow 4G on EVERY route — the second
  // largest resource on the site. WOFF2 is brotli-compressed in the container,
  // so it ships at 73KB with no server config and no decompression step.
  // preload because it's the only face on the page: the swap is guaranteed,
  // so the only question is how early it resolves.
  preload: true,
  src: [
    {
      path: "./fonts/Oddval-Semibold.woff2",
      weight: "100 900",
      style: "normal",
    },
    // When you get more real weights, replace the single entry above with
    // one entry per file, e.g.:
    // { path: "./fonts/Oddval-Regular.woff2", weight: "400", style: "normal" },
    // { path: "./fonts/Oddval-Bold.woff2", weight: "700", style: "normal" },
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
