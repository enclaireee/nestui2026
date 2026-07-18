"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-08-14T23:59:00+07:00");

type Remaining = { days: number; hours: number; minutes: number };

function useCountdown(target: Date): Remaining | null {
  const [time, setTime] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTime({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
      });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

const pad = (n: number) => String(n).padStart(2, "0");

const GLOW = "drop-shadow-[0_2px_12px_rgb(var(--brand-lime)/0.35)]";

export function Hero() {
  const time = useCountdown(DEADLINE);

  // bg-white/5 instead of backdrop-blur-md: the backdrop here is a smooth
  // gradient SVG over a flat bg-brand-green, so blurring it is a visual no-op
  // — but backdrop-filter re-reads and re-blurs the whole region on every zoom
  // step, which is what made zooming lag.
  return (
    <section className="mx-auto mt-8 flex w-fit max-w-6xl flex-col items-center rounded-3xl border border-white/40 bg-white/5 px-6 pb-8 pt-6 sm:px-10">
      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:gap-12">
        <Image
          src="/nestlogo.webp"
          alt="Nest UI 2026 logo"
          width={800}
          height={800}
          priority
          className="h-auto w-44 shrink-0 drop-shadow-2xl sm:w-56 md:w-72"
        />

        <div className="flex max-w-2xl flex-1 flex-col items-start">
          {/* Indent text to the blob's left lobe edge (88/760 ≈ 11.6%). */}
          <div className="w-full pl-[11.6%]">
          <Image
            src="/aboutheronest.webp"
            alt="NEST UI 2026"
            width={2769}
            height={576}
            priority
            className="h-auto w-full max-w-[480px] drop-shadow-xl"
          />

          <p className="mt-3 text-base font-semibold leading-relaxed bg-gradient-to-b from-brand-green/[0.76] via-brand-teal-mid to-brand-emerald-bright bg-clip-text text-transparent sm:text-lg md:text-xl">
            NEST UI is the largest series of scientific competitions and festivals facilitated by IME FTUI, serving as a platform to develop the potential of undergraduate and highschool students across Indonesia.
          </p>

          <p className={`mt-5 text-2xl font-semibold text-gradient-brand sm:text-3xl md:text-4xl ${GLOW}`}>
            Registration closes in
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold sm:text-base md:text-lg">
            <span className="flex items-center gap-1.5 text-gradient-brand">
              <CalendarIcon />
              14 August 2026
            </span>
            <span className="flex items-center gap-1.5 text-gradient-brand">
              <ClockIcon />
              23:59 WIB
            </span>
          </div>
          </div>

          <div className="relative -mt-6 aspect-[760/297] w-full">
            {/* Group 701 already includes the blob, colons and floaters. */}
            <Image
              src="/Group 701.svg"
              alt=""
              aria-hidden="true"
              fill
              priority
              className="object-contain"
            />

            {/* Digit groups pinned to Group 701's blob lobe centers
                (x 88-662 of 760 → 22% / 49% / 77%; blob sits at y≈44%). */}
            <CountdownBlock value={time ? pad(time.days) : "--"} label="Days" className="absolute left-[22%] top-[44%] z-10 -translate-x-1/2 -translate-y-1/2" />
            <CountdownBlock value={time ? pad(time.hours) : "--"} label="Hours" className="absolute left-[49%] top-[44%] z-10 -translate-x-1/2 -translate-y-1/2" />
            <CountdownBlock value={time ? pad(time.minutes) : "--"} label="Minutes" className="absolute left-[77%] top-[44%] z-10 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <Link
        href="#explore"
        className="mt-7 transition-all hover:scale-105 hover:brightness-105 active:scale-100"
      >
        <Image
          src="/Explore Now.svg"
          alt="Explore Now"
          width={200}
          height={60}
          priority
          className="h-auto w-[160px] drop-shadow-lg"
        />
      </Link>
    </section>
  );
}

function CountdownBlock({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <span className={`text-3xl font-extrabold leading-none text-gradient-brand sm:text-5xl md:text-6xl ${GLOW}`}>
        {value}
      </span>
      <span className="mt-1.5 text-xs font-semibold text-gradient-brand sm:text-base md:text-lg">
        {label}
      </span>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5 text-brand-lime md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5 text-brand-lime md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
