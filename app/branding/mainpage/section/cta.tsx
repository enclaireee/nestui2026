"use client";

import React from "react";

export default function CtaSection() {
  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-8 max-w-[1440px] mx-auto flex flex-col items-center text-center">
      {/* Title: "Calling Out Partnership" */}
      <h2
        className="select-none z-10"
        style={{
          fontFamily: "var(--font-oddval), sans-serif",
          fontWeight: 600,
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: "115%",
          color: "#FFF478",
          textShadow: "4px 4px 35px rgba(0, 0, 0, 0.35)",
        }}
      >
        Calling Out <span style={{ fontStyle: "italic" }}>Partnership</span>
      </h2>

      {/* Description */}
      <p
        className="mt-6 max-w-[760px] text-white z-10"
        style={{
          fontFamily: "'SF Pro', ui-sans-serif, sans-serif",
          fontWeight: 400,
          fontSize: "clamp(15px, 1.6vw, 18px)",
          lineHeight: "150%",
        }}
      >
        NEST UI has a proven track record of successful collaborations with
        diverse professionals, ranging from leading multinational corporations to
        innovative startups. These partnerships significantly enrich our event
        content, offering participants fresh insights and connecting them with
        industry leaders and expert practitioners. Our commitment to providing the
        best and most relevant experience for our community is clearly reflected in
        these collaborations.
      </p>

      {/* Become Our Partner button */}
      <button
        className="group mt-10 z-10 flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.06] active:translate-y-0"
        style={{
          padding: "20px 60px",
          borderRadius: "9999px",
          background:
            "linear-gradient(180deg, rgba(255, 253, 238, 0.14) 0%, rgba(124, 165, 74, 0.18) 40%, rgba(12, 52, 44, 0.28) 100%)",
          border: "1.5px solid rgba(227, 239, 38, 0.65)",
          boxShadow:
            "0 10px 22px rgba(7, 52, 44, 0.45), inset 0 1px 1px rgba(255, 253, 238, 0.25), inset 0 -8px 16px rgba(7, 52, 44, 0.35)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-oddval), sans-serif",
            fontWeight: 600,
            fontSize: "clamp(20px, 2.4vw, 28px)",
            lineHeight: "115%",
            color: "#F4F4A0",
            textShadow: "0 2px 4px rgba(7, 52, 44, 0.55)",
          }}
        >
          Become Our Partner
        </span>
      </button>
    </section>
  );
}
