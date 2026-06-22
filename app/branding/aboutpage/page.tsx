import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Description } from "./sections/description";

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-top bg-no-repeat bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/aboutbackground.webp')" }}
    >
      <div className="flex-1 w-full flex flex-col items-center">
        <SiteHeader />

        <div className="flex-1 w-full max-w-5xl flex flex-col p-5">
          <Description />
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
