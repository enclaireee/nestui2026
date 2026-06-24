import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "./sections/hero";
import { Theme } from "./sections/theme";


export default function MainPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-top bg-no-repeat bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/mainpagebackground.webp')" }}
    >
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <SiteHeader />

        <div className="flex-1 w-full max-w-7xl flex flex-col items-center justify-center p-5">
          <Hero />
          <Theme />

        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
