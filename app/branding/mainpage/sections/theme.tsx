"use client";

import Image from "next/image";

export function Theme() {
    return (
        <section className="flex flex-col w-full mt-10 px-6 py-12 items-center overflow-hidden">

            {/* ── Section Title ────────────────────────────────────────────── */}
            <div className="relative flex flex-col items-center text-center">
                {/* Title Shadow Layer */}
                <h2 className="absolute text-5xl sm:text-6xl md:text-8xl font-serif italic font-extrabold text-[#0C342CC2] blur-[10px] opacity-100 select-none">
                    The theme is...
                </h2>
                {/* Title Gradient Layer */}
                <h2 className="relative text-5xl sm:text-6xl md:text-8xl font-serif italic font-extrabold bg-gradient-to-t from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent">
                    The theme is...
                </h2>

                {/* Tagline Tag */}
                <div className="relative mt-6 px-4 max-w-5xl">
                    {/* Shadow Layer */}
                    <p
                        className="absolute inset-0 px-4 text-lg sm:text-xl md:text-4xl font-bold text-[#0C342CC2] blur-[10px] opacity-100 select-none pb-2"
                        style={{ lineHeight: 1.5 }}
                    >
                        “Shaping the future of Healthcare Through Intelligent and Inclusive Innovation”
                    </p>
                    {/* Gradient Layer */}
                    <p
                        className="relative text-lg sm:text-xl md:text-4xl font-bold bg-gradient-to-b from-[#FFFDEE] to-[#E3EF26] bg-clip-text text-transparent pb-2"
                        style={{ lineHeight: 1.5 }}
                    >
                        “Shaping the future of Healthcare Through Intelligent and Inclusive Innovation”
                    </p>
                </div>
            </div>

            {/* ── Cards Grid ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mt-12 md:mt-16 relative z-10">
                <ThemeCard title="Therapeutic Technologies" />
                <ThemeCard title="Diagnostic Intelligence" />
                <ThemeCard title="Nutrition & Sustainable Health Systems" />
            </div>
        </section>
    );
}

/* ── Card Sub-component ─────────────────────────────────────────────── */

interface ThemeCardProps {
    title: string;
}

function ThemeCard({ title }: ThemeCardProps) {
    return (
        <div className="group relative flex flex-col items-center justify-between min-h-[250px] p-8 border border-white/20 rounded-3xl bg-white/15 backdrop-blur-md shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/25 hover:border-white/30">
            {/* Title Container */}
            <div className="relative w-full text-center">
                {/* Title Shadow Layer */}
                <h3 className="absolute inset-x-0 top-0 pt-4 text-xl sm:text-3xl font-extrabold leading-snug tracking-wide text-[#0C342CC2] blur-[8px] opacity-100 select-none">
                    {title}
                </h3>
                {/* Title Gradient Layer */}
                <h3 className="relative pt-4 text-xl sm:text-3xl font-extrabold leading-snug tracking-wide bg-gradient-to-b from-[#FFFDEE] to-[#E3EF26] bg-clip-text text-transparent transition-colors duration-300 group-hover:from-white group-hover:to-white">
                    {title}
                </h3>
            </div>
            {/* See Details Button */}
            <button className="mt-8 px-6 py-2.5 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] text-[#076653] font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg">
                <span>See Details</span>
                <svg
                    className="h-4 w-4 stroke-[3] text-[#076653] transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                </svg>
            </button>
        </div>
    );
}
