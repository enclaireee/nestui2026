import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { RevealFooter } from "@/components/reveal-footer";
import { SiteHeader } from "@/components/site-header";
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
        className={`${oddval.variable} font-sans antialiased bg-brand-green`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Opaque, lifted wrapper: pages render here and cover the fixed
              RevealFooter (z-0) until you scroll to the bottom. The persistent
              header lives inside so its translucent bar reads over the brand
              color instead of the bare canvas. */}
          <div className="relative z-10 bg-brand-green">
            <SiteHeader />
            {/* Pull pages up under the sticky header so their background image
                fills to the very top instead of leaving a dark band where the
                header reserved its flow height. The header is translucent and
                reads over the page background. */}
            <div className="-mt-[60px] sm:-mt-16">{children}</div>
          </div>
          <RevealFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
