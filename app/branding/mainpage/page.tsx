import { RevealFooter } from "@/components/reveal-footer";
import { SiteHeader } from "@/components/site-header";

export default function MainPage() {
  return (
    <>
      <main
        className="relative z-10 min-h-screen flex flex-col items-center bg-[#0C342C] bg-top bg-no-repeat bg-[length:100%_auto]"
        style={{ backgroundImage: "url('/mainpagebackground.webp')" }}
      >
        <div className="flex-1 w-full flex flex-col items-center">
          <SiteHeader />

          <div className="flex-1 w-full max-w-5xl flex flex-col p-5">
            {/* Add your elements here */}
          </div>
        </div>
      </main>

      <RevealFooter />
    </>
  );
}
