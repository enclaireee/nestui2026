// No "use client": this section is static markup and a mailto link — it had no
// state or handlers to justify shipping it to the browser as a client component.
import React from "react";

// The partnership contact. Same address as the footer.
const PARTNER_EMAIL = "nestui.ft@gmail.com";
const PARTNER_SUBJECT = "Partnership Inquiry — NEST UI 2026";

export default function CtaSection() {
  return (
    <section className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 py-16 text-center md:px-8 md:py-24">
      <h2 className="z-10 select-none text-[clamp(36px,5vw,56px)] font-semibold leading-[115%] text-brand-butter [text-shadow:4px_4px_35px_rgb(0_0_0/0.35)]">
        Calling Out <span className="italic">Partnership</span>
      </h2>

      {/* max-w in ch, not px: this paragraph was running to ~110 characters per
          line on a wide screen, well past the 50–75 that stays readable. */}
      <p className="z-10 mt-6 max-w-[65ch] text-[clamp(15px,1.6vw,18px)] leading-[1.6] text-white/85">
        NEST UI has a proven track record of successful collaborations with
        diverse professionals, ranging from leading multinational corporations to
        innovative startups. These partnerships significantly enrich our event
        content, offering participants fresh insights and connecting them with
        industry leaders and expert practitioners.
      </p>

      {/* Was a <button> with no onClick and no href — a dead CTA rendered on
          both the main page and the About page, exactly where an interested
          sponsor would click. */}
      <a
        href={`mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(PARTNER_SUBJECT)}`}
        className="group z-10 mt-10 flex items-center justify-center rounded-full border-[1.5px] border-brand-lime/65 px-12 py-5 transition-all duration-150 hover:-translate-y-0.5 hover:brightness-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0"
        style={{
          // Was rgba(124,165,74,…) — a green that exists nowhere in the palette.
          background:
            "linear-gradient(180deg, rgb(var(--brand-cream) / 0.14) 0%, rgb(var(--brand-lime) / 0.12) 40%, rgb(var(--brand-green) / 0.28) 100%)",
          boxShadow:
            "0 10px 22px rgb(var(--brand-green) / 0.45), inset 0 1px 1px rgb(var(--brand-cream) / 0.25), inset 0 -8px 16px rgb(var(--brand-green) / 0.35)",
        }}
      >
        <span className="text-[clamp(20px,2.4vw,28px)] font-semibold leading-[115%] text-brand-butter-soft [text-shadow:0_2px_4px_rgb(var(--brand-green)/0.55)]">
          Become Our Partner
        </span>
      </a>

      <p className="z-10 mt-4 text-xs text-white/50">
        Opens your email app · {PARTNER_EMAIL}
      </p>
    </section>
  );
}
