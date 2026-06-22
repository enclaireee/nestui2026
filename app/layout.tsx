import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
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

// Optional alternate font, available as the `font-geller` utility in Tailwind.
// Uncomment once you've added a Geller file to app/fonts/, then re-add
// `${geller.variable}` to the <body> className below.
// const geller = localFont({
//   variable: "--font-geller",
//   display: "swap",
//   src: [
//     {
//       path: "./fonts/Geller-Regular.ttf",
//       weight: "400",
//       style: "normal",
//     },
//   ],
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oddval.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
