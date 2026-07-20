"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { duration, ease, inViewOnce, offset, rest } from "@/lib/motion";

const entry = {
    initial: { opacity: 0, ...offset.up },
    whileInView: rest,
    viewport: inViewOnce,
};

// Subtheme copy from the NEST UI 2026 guidebook briefs.
const CARDS = [
    {
        title: "Therapeutic Technologies",
        desc: "Developing solutions that support therapy, recovery, medication management, and mental health to improve the quality of patient care.",
    },
    {
        title: "Diagnostic Intelligence",
        desc: "Developing solutions that help the diagnosis and decision-making process in healthcare — from early disease detection to faster, more accurate interpretation of examination results.",
    },
    {
        title: "Nutrition & Sustainable Health Systems",
        desc: "Developing solutions that support nutrition monitoring, healthy lifestyle adoption, and more effective and sustainable healthcare management.",
    },
];

export function Theme() {
    return (
        <section className="flex flex-col w-full mt-10 px-6 py-12 items-center overflow-hidden">

            <div className="relative flex flex-col items-center text-center">
                {/* Shadow and gradient layer animate separately but on the same
                    timing, so the blurred layer never lags behind the text.
                    A shared wrapper isn't an option: the shadow is absolutely
                    positioned against this flex container. */}
                <motion.h2
                    {...entry}
                    transition={{ duration, ease }}
                    className="absolute text-5xl sm:text-6xl md:text-8xl font-serif italic font-extrabold text-brand-green/[0.76] blur-[10px] opacity-100 select-none"
                >
                    The theme is...
                </motion.h2>
                <motion.h2
                    {...entry}
                    transition={{ duration, ease }}
                    className="relative text-5xl sm:text-6xl md:text-8xl font-serif italic font-extrabold bg-gradient-to-t from-brand-lime to-brand-cream bg-clip-text text-transparent"
                >
                    The theme is...
                </motion.h2>

                <motion.div
                    {...entry}
                    transition={{ duration, ease, delay: 0.12 }}
                    className="relative mt-6 px-4 max-w-5xl"
                >
                    <p
                        className="absolute inset-0 px-4 text-lg sm:text-xl md:text-4xl font-bold text-brand-green/[0.76] blur-[10px] opacity-100 select-none pb-2"
                        style={{ lineHeight: 1.5 }}
                    >
                        “Shaping the future of Healthcare Through Intelligent and Inclusive Innovation”
                    </p>
                    <p
                        className="relative text-lg sm:text-xl md:text-4xl font-bold bg-gradient-to-b from-brand-cream to-brand-lime bg-clip-text text-transparent pb-2"
                        style={{ lineHeight: 1.5 }}
                    >
                        “Shaping the future of Healthcare Through Intelligent and Inclusive Innovation”
                    </p>
                </motion.div>
            </div>

            {/* items-start so an expanded card grows on its own without
                stretching its row-mates. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mt-12 md:mt-16 relative z-10 items-start">
                {CARDS.map((c, i) => (
                    <ThemeCard key={c.title} {...c} delay={i * 0.12} />
                ))}
            </div>
        </section>
    );
}


interface ThemeCardProps {
    title: string;
    desc: string;
    /** Stagger offset in seconds across the card row. */
    delay?: number;
}

function ThemeCard({ title, desc, delay = 0 }: ThemeCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            {...entry}
            transition={{ duration, ease, delay }}
            className={`group relative flex flex-col justify-between min-h-[250px] p-8 border rounded-3xl bg-white/15 backdrop-blur-md shadow-2xl transition-colors duration-200 ${
                open
                    ? "border-brand-lime/50 bg-white/25"
                    : "border-white/20 hover:bg-white/25 hover:border-white/30"
            }`}
        >
            <div>
                <div className="relative w-full text-center">
                    <h3 className="absolute inset-x-0 top-0 pt-4 text-xl sm:text-3xl font-extrabold leading-snug tracking-wide text-brand-green/[0.76] blur-[8px] opacity-100 select-none">
                        {title}
                    </h3>
                    <h3 className="relative pt-4 text-xl sm:text-3xl font-extrabold leading-snug tracking-wide bg-gradient-to-b from-brand-cream to-brand-lime bg-clip-text text-transparent transition-colors duration-300 group-hover:from-white group-hover:to-white">
                        {title}
                    </h3>
                </div>

                {/* Description mounts on open; a one-shot opacity+translate
                    (GPU-composited) fades it in — no per-frame layout animation. */}
                {open && (
                    <div className="mt-6 border-t border-white/25 pt-5 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm sm:text-base leading-relaxed text-white/90">
                            {desc}
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="btn-brand mt-8 px-6 py-2.5 text-sm"
            >
                <span>{open ? "Show Less" : "See Details"}</span>
                <svg
                    className={`h-4 w-4 stroke-[3] text-brand-teal transition-transform duration-200 ${
                        open ? "rotate-90" : ""
                    }`}
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
        </motion.div>
    );
}
