"use client";

// Catches render/data errors in any route segment below the root layout (e.g. a
// Supabase fetch timeout) so one failing page doesn't blank the whole app.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-white">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-white/60">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-6 py-2.5 text-sm font-bold text-brand-teal"
      >
        Try again
      </button>
    </div>
  );
}
