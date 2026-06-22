import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/aboutbackground.webp')" }}
    >
      <div className="flex-1 w-full flex flex-col items-center">
        <SiteHeader />

        <div className="flex-1 w-full max-w-5xl flex flex-col p-5">
          {/* Add your elements here */}
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
