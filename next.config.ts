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
