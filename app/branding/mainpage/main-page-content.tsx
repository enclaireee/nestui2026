import Image from "next/image";
import CompetitionSection from "./section/competition";
import TimelineSection from "./section/timeline";
import CtaSection from "./section/cta";
import { Hero } from "./section/hero";
import { Theme } from "./section/theme";
import { bgSvg } from "@/lib/bg-svg";
import { ParallaxFloat } from "@/components/parallax-float";

export function MainPageContent() {
  return (
    <main className="relative min-h-screen flex flex-col items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transform-gpu [contain:paint] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />
      <ParallaxFloat
        distance={90}
        className="pointer-events-none absolute left-0 top-0 -z-10 w-44 sm:w-64 md:w-80"
      >
        <Image
          src="/flowerfloater.webp"
          alt=""
          aria-hidden
          width={985}
          height={985}
          sizes="(min-width: 768px) 320px, (min-width: 640px) 256px, 176px"
          className="h-auto w-full"
        />
      </ParallaxFloat>
      <ParallaxFloat
        distance={140}
        className="pointer-events-none absolute right-0 top-0 -z-10 w-40 sm:w-56 md:w-72"
      >
        <Image
          src="/rightfloater.webp"
          alt=""
          aria-hidden
          width={622}
          height={667}
          sizes="(min-width: 768px) 288px, (min-width: 640px) 224px, 160px"
          className="h-auto w-full"
        />
      </ParallaxFloat>
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
