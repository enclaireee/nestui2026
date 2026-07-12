import Link from "next/link";
import { GlassCard } from "./glass-card";
import { COMPETITIONS, type CompetitionId } from "@/lib/registrations/config";

export function AlreadyRegistered({
  teamName,
  competition,
}: {
  teamName: string;
  competition: CompetitionId;
}) {
  const cfg = COMPETITIONS[competition];
  return (
    <div className="relative flex flex-col min-h-screen w-full items-center justify-center pt-24 pb-24 px-4 md:px-8">
      <h1 className="text-5xl md:text-6xl font-bold text-gradient-brand drop-shadow-md pb-3 text-center">
        Already Registered
      </h1>
      <GlassCard className="mt-8 flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-brand-green">
          Your team &ldquo;{teamName}&rdquo; is already registered for {cfg?.name ?? competition}.
        </p>
        <p className="text-sm text-brand-green/70">
          Only one team per account. Check your submission status on your dashboard.
        </p>
        <Link
          href="/protected"
          className="mt-2 rounded-2xl bg-gradient-to-r from-brand-lime to-brand-cream px-10 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          Go to Dashboard
        </Link>
      </GlassCard>
    </div>
  );
}
