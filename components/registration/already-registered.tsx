import Link from "next/link";
import { GlassCard } from "./glass-card";
import { COMPETITIONS, type CompetitionId } from "@/lib/registrations/config";

/**
 * Shown on the registration route once this account already has a team — it's
 * one team per account. Extra paid entries don't go through registration again;
 * they go through "Submit again" on the dashboard, so that's where this points.
 * Rendered inside RegistrationPage's <main>, which carries the SVG background.
 */
export function AlreadyRegistered({
  teams,
}: {
  teams: { team_name: string; competition: CompetitionId }[];
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 pb-24 pt-24 md:px-8">
      <h1 className="pb-3 text-center text-3xl font-bold text-gradient-brand drop-shadow-md sm:text-5xl md:text-6xl">
        You&apos;ve Already Registered
      </h1>
      <GlassCard className="mt-8 flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-brand-green">
          {teams.length > 1
            ? "Your teams are already registered."
            : "Your team is already registered."}
        </p>

        <ul className="flex w-full flex-col gap-2">
          {teams.map((t) => (
            <li
              key={t.competition}
              className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/5 px-4 py-2.5 text-left text-sm ring-1 ring-brand-green/10"
            >
              <span className="font-semibold text-brand-green">{t.team_name}</span>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-brand-green/60">
                {COMPETITIONS[t.competition]?.name ?? t.competition}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-sm text-brand-green/70">
          It&apos;s one team per account. To add another submission — a separate
          paid entry — head to your dashboard and use{" "}
          <span className="font-semibold text-brand-green">Submit again</span>.
        </p>
        <Link href="/protected" className="btn-brand mt-2 px-10 py-2.5 text-sm">
          Go to dashboard for another submission
        </Link>
      </GlassCard>
    </div>
  );
}
