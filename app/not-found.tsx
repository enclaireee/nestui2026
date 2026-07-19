import Link from "next/link";
import Image from "next/image";

// Every mistyped URL and every stale link used to land on Next's unstyled
// default 404 — black text on white, no header, no way back — which reads as
// "the site is broken" rather than "that address doesn't exist".
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-green px-6 py-24 text-center">
      <Image
        src="/nestlogo.webp"
        alt=""
        aria-hidden
        width={600}
        height={580}
        className="h-auto w-24 opacity-90 drop-shadow-xl"
      />

      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-lime">
        Error 404
      </p>

      <h1 className="text-3xl font-bold text-gradient-brand drop-shadow-md sm:text-5xl">
        This page doesn&apos;t exist
      </h1>

      <p className="max-w-md text-sm leading-relaxed text-white/60">
        The link may be out of date, or the address has a typo. Your registration
        and submissions are unaffected — everything is still on your dashboard.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link href="/branding/mainpage" className="btn-brand px-8 py-2.5 text-sm">
          Back to home
        </Link>
        <Link href="/protected" className="btn-ghost px-8 py-2.5 text-sm">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
