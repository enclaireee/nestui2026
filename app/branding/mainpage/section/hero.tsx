"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-08-14T23:59:00+07:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });

  return time;
}

function Pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Hero() {
  const { days, hours, minutes } = useCountdown(DEADLINE);

  return (
    <section className="flex w-fit self-center flex-col items-center justify-center px-10 pb-6 mt-10 border border-white rounded-3xl backdrop-blur-xl">
      <div className="flex w-full flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
        <div className="w-full drop-shadow-2xl sm:h-96 sm:w-96 md:h-[400px] md:w-[400px]">
          <Image
            src="/nestlogo.webp"
            alt="Nest UI 2026 logo"
            width={800}
            height={800}
            priority
            className="w-full drop-shadow-2xl sm:h-full sm:w-full"
          />
        </div>

        <div className="w-[800px] flex flex-1 flex-col items-start">
          {/* Title */}
          <Image
            src="/aboutheronest.webp"
            alt="NEST UI 2026"
            width={2769}
            height={576}
            priority
            className="w-max h-auto drop-shadow-2xl"
          />
          <p className="mt-2 text-base sm:text-xl md:text-2xl font-semibold leading-relaxed bg-gradient-to-b from-[#0C342CC2] via-[#186757] to-[#009477] bg-clip-text text-transparent">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </p>
          <p className="text-base sm:text-xl md:text-2xl font-semibold leading-relaxed bg-gradient-to-b from-[#0C342CC2] via-[#186757] to-[#009477] bg-clip-text text-transparent">
            Harum, eos hic officia, deserunt exercitationem, sunt provident itaque debitis minima praesentium
          </p>

          <div className="relative mt-6">
            <p className="absolute pb-3 text-base sm:text-3xl md:text-5xl font-semibold leading-relaxed text-[#0C342CC2] blur-[6px] opacity-100 select-none">
              Registration closes in
            </p>
            <p className="relative pb-3 text-base sm:text-3xl md:text-5xl font-semibold leading-relaxed bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent">
              Registration closes in
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 sm:text-xl md:text-4xl font-semibold">
            <span className="relative flex items-center gap-1 pb-2">
              <span className="absolute flex items-center gap-1 text-[#0C342CC2] blur-[4px] opacity-100 select-none">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                14 August 2026
              </span>
              <span className="relative flex items-center gap-1 bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent pb-2">
                <svg className="h-10 w-10 text-[#E3EF26]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                14 August 2026
              </span>
            </span>

            <span className="relative flex items-center gap-1 pb-2">
              <span className="absolute flex items-center gap-1 text-[#0C342CC2] blur-[4px] opacity-100 select-none">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                23:59 WIB
              </span>
              <span className="relative flex items-center gap-1 bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent pb-2">
                <svg className="h-10 w-10 text-[#E3EF26]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                23:59 WIB
              </span>
            </span>
          </div>

          <div className="relative flex items-center justify-center w-[650px] h-[200px]">
            <Image
              src="/fluid.svg"
              alt=""
              width={230}
              height={230}
              aria-hidden="true"
              className="absolute -left-32 -bottom-10 opacity-90 pointer-events-none"
            />
            <Image
              src="/Ellipse 5.svg"
              alt=""
              width={176}
              height={185}
              aria-hidden="true"
              className="absolute right-[128px] -bottom-10 opacity-90 pointer-events-none"
            />
            <Image
              src="/Group 3.svg"
              alt=""
              width={176}
              height={185}
              aria-hidden="true"
              className="absolute -right-24 bottom-10 opacity-90 pointer-events-none"
            />
            <Image
              src="/Ellipse 2.svg"
              alt="countdown"
              fill
              className="object-contain"
            />

            <div className="relative z-10 flex items-center gap-12 px-8 py-4">
              <CountdownBlob value={Pad(days)} label="Days" />
              <Colon />
              <CountdownBlob value={Pad(hours)} label="Hours" />
              <Colon />
              <CountdownBlob value={Pad(minutes)} label="Minutes" />
            </div>
          </div>

        </div>
      </div>
      <div className="flex w-full justify-center items-center mt-8">
        <Link href="#explore">
          <Image
            src="/explore Now.svg"
            alt="Explore Now"
            width={200}
            height={60}
            className="transition-all hover:scale-105 hover:brightness-105 active:scale-100 drop-shadow-lg"
          />
        </Link>
      </div>
    </section>
  );
}


function CountdownBlob({ value, label }: { value: string; label: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center w-[120px] h-[120px]">
      <span className="relative z-10 text-8xl font-extrabold bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent">
        {value}
      </span>
      <span className="relative z-10 mt-1 w-full border-t border-[#E3EF26]/60" />
      <span className="relative z-10 text-2xl font-semibold bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span className="mb-4 text-6xl font-extrabold bg-gradient-to-r from-[#E3EF26] to-[#FFFDEE] bg-clip-text text-transparent select-none">
      :
    </span>
  );
}
