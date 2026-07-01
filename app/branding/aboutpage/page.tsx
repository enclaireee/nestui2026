import { Description } from "./sections/description";
import { Vision } from "./sections/vision";
import { Mission } from "./sections/mission";
import { Sponsors } from "./sections/sponsor";
import { PastSponsors } from "./sections/pastSponsors";
import { Dokumentasi } from "./sections/documentation";
import CtaSection from "../mainpage/section/cta";

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-brand-green bg-top bg-no-repeat bg-[length:auto_100%] md:bg-[length:120%_auto]"
      style={{ backgroundImage: "url('/aboutbackground.webp')" }}
    >
      <div className="flex-1 w-full max-w-5xl flex flex-col p-5">
        <Description />
        <Vision />
        <Mission />
        <Sponsors />
        <PastSponsors />
        <Dokumentasi />
        <CtaSection />
      </div>
    </main>
  );
}
