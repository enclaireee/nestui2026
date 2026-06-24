import { Description } from "./sections/description";
import { Vision } from "./sections/vision";

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-[#0C342C] bg-top bg-no-repeat bg-[length:120%_auto]"
      style={{ backgroundImage: "url('/aboutbackground.webp')" }}
    >
      <div className="flex-1 w-full max-w-5xl flex flex-col p-5">
        <Description />
        <Vision />
      </div>
    </main>
  );
}
