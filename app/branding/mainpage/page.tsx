import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import CompetitionSection from "./section/competition";
import TimelineSection from "./section/timeline";
import CtaSection from "./section/cta";
import { Hero } from "./section/hero";
import { Theme } from "./section/theme";


const bgSvg = readFileSync(
  join(process.cwd(), "public/mainpagebackground.svg"),
  "utf8",
).replace("<svg", '<svg preserveAspectRatio="xMidYMid slice"');

export default function MainPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transform-gpu [contain:paint] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />
      <Image
        src="/flowerfloater.webp"
        alt=""
        aria-hidden
        width={985}
        height={985}
        sizes="(min-width: 768px) 320px, (min-width: 640px) 256px, 176px"
        className="pointer-events-none absolute left-0 top-0 -z-10 h-auto w-44 sm:w-64 md:w-80"
      />
      <Image
        src="/rightfloater.webp"
        alt=""
        aria-hidden
        width={622}
        height={667}
        sizes="(min-width: 768px) 288px, (min-width: 640px) 224px, 160px"
        className="pointer-events-none absolute right-0 top-0 -z-10 h-auto w-40 sm:w-56 md:w-72"
      />
      <div className="flex-1 justify-center w-full max-w-6xl flex flex-col p-5 gap-16 md:gap-24 my-8">
        <Hero />

        <div id="explore" className="scroll-mt-24">
          <Theme />
        </div>

        <CompetitionSection />

        <TimelineSection />

        <CtaSection />
      </div>
    </main>
  );
}
