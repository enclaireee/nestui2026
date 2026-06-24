import CompetitionSection from "./section/competition";
import TimelineSection from "./section/timeline";
import CtaSection from "./section/cta";
import { Hero } from "./section/hero";
import { Theme } from "./section/theme";


export default function MainPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-top bg-no-repeat bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/mainpagebackground.webp')" }}
    >
      <div className="flex-1 justify-center w-full max-w-6xl flex flex-col p-5 gap-16 md:gap-24 my-8">
        <Hero />

        <Theme />

        <CompetitionSection />

        <TimelineSection />

        <CtaSection />
      </div>
    </main>
  );
}
