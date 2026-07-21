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
    // One panel is always open. The old version let all three toggle
    // independently, which left the row ragged and gave the section no
    // resting state — there was never a "correct" thing to look at.
    const [active, setActive] = useState(0);

    return (
        <section className="flex flex-col w-full mt-10 px-6 py-12 items-center overflow-hidden">

            {/* PERF: each heading here used to be rendered TWICE — a second
                copy underneath with `blur-[10px]`, faking a drop shadow. A CSS
                filter forces its own compositing layer and re-rasterises a
                full-size blurred surface of a `text-8xl` string; four of those
                sat permanently behind this section and had to be recomposited
                on every frame of the panel transition below. `text-shadow` is
                painted inline with the glyphs, costs no extra layer, and looks
                the same at this blur radius. */}
            <div className="flex flex-col items-center text-center">
                <motion.h2
                    {...entry}
                    transition={{ duration, ease }}
                    className="text-5xl sm:text-6xl md:text-8xl font-serif italic font-extrabold bg-gradient-to-t from-brand-lime to-brand-cream bg-clip-text text-transparent [text-shadow:0_4px_18px_rgb(var(--brand-green)/0.55)]"
                >
                    The theme is...
                </motion.h2>

                <motion.div
                    {...entry}
                    transition={{ duration, ease, delay: 0.12 }}
                    className="mt-6 px-4 max-w-5xl"
                >
                    <p
                        className="text-lg sm:text-xl md:text-4xl font-bold bg-gradient-to-b from-brand-cream to-brand-lime bg-clip-text text-transparent pb-2 [text-shadow:0_3px_14px_rgb(var(--brand-green)/0.5)]"
                        style={{ lineHeight: 1.5 }}
                    >
                        “Shaping the future of Healthcare Through Intelligent and Inclusive Innovation”
                    </p>
                </motion.div>
            </div>

            {/* Below lg this is a vertical accordion (flex-col, panels grow in
                height); at lg+ the same markup becomes a horizontal filmstrip
                (flex-row, panels grow in width). One implementation, one state,
                both axes — flex-grow doesn't care which direction it runs in. */}
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={inViewOnce}
                variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                className="mt-12 md:mt-16 flex w-full max-w-7xl flex-col gap-4 lg:h-[440px] lg:flex-row lg:gap-5"
            >
                {CARDS.map((c, i) => (
                    <ThemePanel
                        key={c.title}
                        index={i}
                        title={c.title}
                        desc={c.desc}
                        expanded={i === active}
                        onSelect={() => setActive(i)}
                    />
                ))}
            </motion.div>
        </section>
    );
}

interface ThemePanelProps {
    index: number;
    title: string;
    desc: string;
    expanded: boolean;
    onSelect: () => void;
}

function ThemePanel({ index, title, desc, expanded, onSelect }: ThemePanelProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, ...offset.up },
                show: { ...rest, transition: { duration, ease } },
            }}
            // The expansion itself: a CSS transition on flex-grow. Native,
            // interruptible, and it already obeys the global
            // prefers-reduced-motion rule in globals.css — none of which is
            // true of a JS-driven height animation.
            //
            // The grow/basis pair is lg-only ON PURPOSE. Below lg the row is a
            // column with no fixed height, and `basis-0` there gave every panel
            // a zero base size with no free space to grow into — they collapsed
            // to ~100px and the titles were clipped away entirely. So: content
            // height on mobile (the description's grid-rows accordion does the
            // expanding), proportional widths from lg up.
            // PERF: no backdrop-filter and no cursor-tracked blob. Both were
            // re-rasterising large areas on every frame of this transition;
            // the glass is a flat translucent fill instead, which over the
            // backdrop reads near-identically and costs nothing.
            className={`group relative flex basis-auto grow-0 flex-col overflow-hidden rounded-3xl border p-7 text-left
                transition-[flex-grow,background-color,border-color] duration-300 ease-out
                lg:basis-0 lg:p-8
                ${expanded ? "lg:grow-[2.6]" : "lg:grow"}
                ${
                    expanded
                        ? "border-brand-lime/45 bg-white/[0.28] lg:bg-white/[0.22]"
                        : "border-white/20 bg-white/[0.16] hover:border-white/35 lg:bg-white/[0.10] lg:hover:bg-white/[0.16]"
                }`}
        >
            {/* Top-edge highlight: the one-pixel bright line along the upper
                border is most of what separates real glass from a translucent
                rectangle. Brightens on the open panel. */}
            <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500 ${
                    expanded ? "via-brand-lime/70 opacity-100" : "via-white/60 opacity-70"
                }`}
            />

            {/* Oversized index watermark, anchored bottom-right so it fills
                the lower half of the panel rather than leaving it empty. */}
            <span
                aria-hidden
                className={`pointer-events-none absolute -bottom-8 -right-3 select-none text-[9rem] font-extrabold leading-none transition-all duration-300 ${
                    expanded ? "text-brand-lime/[0.12]" : "text-white/[0.07] group-hover:text-white/[0.12]"
                }`}
            >
                {index + 1}
            </span>

            <button
                type="button"
                onClick={onSelect}
                onFocus={onSelect}
                aria-expanded={expanded}
                aria-controls={`subtheme-panel-${index}`}
                // Stretched hit area — the ::after has no `relative` on this
                // button, so it anchors to the panel and covers the whole
                // thing. It's applied ONLY while collapsed: an open panel's
                // click is a no-op anyway, and a full-bleed overlay there
                // would make its description impossible to select.
                className={`z-10 text-left focus-visible:outline-none ${
                    expanded ? "" : "after:absolute after:inset-0 after:content-['']"
                }`}
            >
                <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-lime/90">
                    <span
                        className={`h-px bg-brand-lime/60 transition-all duration-300 ease-out ${
                            expanded ? "w-10" : "w-6"
                        }`}
                    />
                    Subtheme {String(index + 1).padStart(2, "0")}
                </span>

                {/* Scale, not font-size. Animating font-size relayouts and
                    rewraps the text every frame — that was the jank. A
                    transform is composited, so the growth is genuinely smooth,
                    and origin-left keeps it pinned to the column edge.
                    `break-words` is the belt-and-braces for the longest name. */}
                {/* Scale, not font-size. Animating font-size relayouts and
                    rewraps the text every frame — that was the jank. A
                    transform is composited, so the growth is genuinely smooth.
                    The paired 80% width is what keeps it honest: scaling 1.25
                    from origin-top-left pushes the right edge 25% past the box,
                    and the panel's overflow-hidden was chopping the longest
                    title. 0.8 × 1.25 = 1, so it lands exactly on the column. */}
                <h3
                    className={`mt-4 origin-top-left break-words text-2xl font-extrabold leading-tight tracking-wide text-white transition-transform duration-300 ease-out ${
                        expanded ? "lg:w-4/5 lg:scale-[1.25]" : "lg:w-full lg:scale-100"
                    }`}
                >
                    {title}
                </h3>
            </button>

            {/* Description. `grid-template-rows: 0fr → 1fr` is the native way
                to animate to height:auto — no measuring, no JS, no jump. The
                old version mounted this with `{open && …}`, so it appeared
                instantly at full height and shoved the page down.

                The inner wrapper is width-locked at lg so the copy doesn't
                reflow while the panel is still growing; the panel's
                overflow-hidden clips it instead of rewrapping every frame. */}
            <div
                id={`subtheme-panel-${index}`}
                // Asymmetric timing is what sells it: on open the copy waits
                // ~120ms so the panel is already moving before text appears;
                // on close it drops out immediately so it never lingers over a
                // shrinking panel. Same trick both directions would read as
                // sluggish one way and abrupt the other.
                className={`relative z-10 grid transition-[grid-template-rows,opacity] ease-out ${
                    expanded
                        ? "grid-rows-[1fr] opacity-100 duration-300"
                        : "grid-rows-[0fr] opacity-0 duration-200"
                }`}
            >
                <div className="overflow-hidden">
                    {/* Width-locked at lg so the copy doesn't rewrap on every
                        frame while the panel is still growing; the panel's
                        overflow-hidden clips it instead. */}
                    <div className="pt-6 lg:w-[380px]">
                        <div className="h-px w-full bg-gradient-to-r from-brand-lime/50 to-transparent" />
                        <p className="mt-5 text-sm leading-relaxed text-white/90 lg:text-base">
                            {desc}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
