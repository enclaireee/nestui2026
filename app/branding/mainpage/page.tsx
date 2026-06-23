import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import CompetitionSection from "./section/competition";
import TimelineSection from "./section/timeline";

export default function MainPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-top bg-no-repeat bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/mainpagebackground.webp')" }}
    >
      {/* Outer container ensuring vertical flow layout and header/footer positioning */}
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Navigation bar header */}
        <SiteHeader />

        {/* Core content grid wrapper displaying page sections */}
        <div className="flex-1 w-full max-w-6xl flex flex-col p-5 gap-16 md:gap-24 my-8">
          {/* Competition section showing Medhack, Healthineer, Healthynovation */}
          <CompetitionSection />

          {/* Timeline milestone section showing dates and clover markers */}
          <TimelineSection />
        </div>

        {/* Footer info links */}
        <SiteFooter />
      </div>
    </main>
  );
}
