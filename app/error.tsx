"use client";

import Link from "next/link";


export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-white/60">
        We hit an unexpected error loading this page. Please try again.
      </p>
      {/* "Try again" re-runs the render that just failed. Without a second
          door out, the browser back button was the only escape on mobile. */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-brand px-6 py-2.5 text-sm">
          Try again
        </button>
        <Link href="/branding/mainpage" className="btn-ghost px-6 py-2.5 text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}
