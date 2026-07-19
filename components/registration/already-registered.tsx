import Link from "next/link";
import { GlassCard } from "./glass-card";
import { COMPETITIONS, type CompetitionId } from "@/lib/registrations/config";

/**
 * Shown only when there is nothing left for this account to enter — every
 * competition available to them already has a team. The DB rule is one team per
 * (user, competition), so a single registration is NOT a dead end and must not
 * land here; the picker marks that competition taken instead.
 */
export function AlreadyRegistered({
  teams,
}: {
  teams: { team_name: string; competition: CompetitionId }[];
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 pb-24 pt-24 md:px-8">
      <h1 className="pb-3 text-center text-3xl font-bold text-gradient-brand drop-shadow-md sm:text-5xl md:text-6xl">
        You&apos;re all set
      </h1>
      <GlassCard className="mt-8 flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-brand-green">
          You&apos;ve registered a team for every competition open to you.
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
          Track verification status, or add another paid submission, from your
          dashboard.
        </p>
        <Link href="/protected" className="btn-brand mt-2 px-10 py-2.5 text-sm">
          Go to dashboard
        </Link>
      </GlassCard>
    </div>
  );
}
