import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MoreSubmissionClient } from "./more-submission-client";

const bgSvg = readFileSync(
  join(process.cwd(), "public/mainpagebackground.svg"),
  "utf8",
).replace("<svg", '<svg preserveAspectRatio="xMidYMid slice"');

export default function MoreSubmissionTemplate() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-24 overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 transform-gpu [contain:paint] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />
      <img
        src="/lefttopfloaterreg.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-auto w-44 sm:w-64 md:w-80 opacity-80"
      />
      <img
        src="/rightfloaterreg.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 -z-10 h-auto w-96 sm:w-90 md:w-100 opacity-80"
      />

      <div className="z-10 w-full max-w-2xl px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gradient-brand drop-shadow-md pb-8 text-center">
          More Submission
        </h1>

        <div className="w-full">
          <MoreSubmissionClient />
        </div>
      </div>
    </main>
  );
}
