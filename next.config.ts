import type { NextConfig } from "next";

// Supabase is the only external origin the browser talks to (auth + REST).
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// ponytail: `unsafe-inline` script-src, not a nonce. A nonce CSP in Next needs
// per-request middleware rewriting every script tag, and this app's proxy
// deliberately does NOT run on public pages (see proxy.ts matcher) — adding it
// back would reintroduce the latency that matcher exists to avoid. The other
// directives still do real work: frame-ancestors kills clickjacking on the
// admin panel, connect-src stops exfiltration to a third-party host, and
// base-uri/form-action block two common injection escalations. Upgrade to a
// nonce policy if untrusted HTML ever gets rendered.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'", // Tailwind + inline style attrs
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace(/^https:/, "wss:")}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Image Optimization is metered per transformation + cache write, and the
  // production quota ran out (402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED on
  // every /_next/image request). Everything under public/ is a static brand
  // asset that changes maybe twice a year, so the defaults are wildly
  // over-eager for this site. Levers per Vercel's "Reducing usage" guidance:
  images: {
    // Optimizer OFF. Vercel's Image Optimization quota is exhausted (every
    // /_next/image returns 402), and registration is live, so correctness now
    // beats bytes later: every image is served straight from public/ instead.
    //
    // What this costs: no srcset, so one file serves every viewport and DPR,
    // and no format negotiation. The `sizes` props throughout the app go inert
    // (harmless — they're correct if this is ever flipped back).
    //
    // ponytail: the settings below are dormant while this is true, but they're
    // the tuned values (~150 transformations/month vs ~67,500 before). Delete
    // this one line to re-enable the optimizer properly once the quota resets.
    unoptimized: true,

    // THE BIG ONE. Default is 14400 — four hours — after which every image is
    // re-transformed and re-written to cache. These files never change between
    // deploys, so 31 days (the documented max-age recommendation) cuts cache
    // writes by ~180x on its own.
    minimumCacheTTL: 2678400,

    // 6 widths instead of the default 15 (8 deviceSizes + 7 imageSizes). Each
    // distinct width is a separate transformation per image, so this is a ~2.5x
    // cut. Chosen to cover what this app actually asks for via its `sizes`
    // props — 384 for the competition logos, 640 for sponsors/floaters, 1200
    // for the step art at 2x, 1920 for the about-page hero at 2x.
    deviceSizes: [640, 1200, 1920],
    imageSizes: [128, 256, 384],

    // `formats` and `qualities` are left alone deliberately: Next 16 already
    // defaults to ["image/webp"] (not avif+webp) and [75], so the two levers
    // the docs mention there are already in their cheapest position here.
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // Participant-supplied links are rendered in the admin panel; without
          // this the admin URL (with the registration UUID) leaks to whatever
          // host a reviewer clicks through to.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // The export is participant PII — never let a proxy or the browser keep it.
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
