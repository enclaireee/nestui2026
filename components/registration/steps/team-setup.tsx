"use client";

import Image from "next/image";
import { Users, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegistrationInput } from "../registration-input";
import { SectionLabel } from "../section-label";
import {
  competitionsForCategory,
  teamSizeOptions,
  COMPETITIONS,
  type Category,
  type CompetitionConfig,
  type CompetitionId,
} from "@/lib/registrations/config";

interface TeamSetupProps {
  category?: Category;
  competition: CompetitionId | null;
  teamName: string;
  teamSize: number | null;
  onSelectCompetition: (id: CompetitionId) => void;
  onTeamName: (v: string) => void;
  onSelectSize: (n: number) => void;
  onNext: () => void;
}

const titleGradient: React.CSSProperties = {
  backgroundImage: "linear-gradient(90deg, #0C342C 0%, #076653 60%, #0E8057 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

export function TeamSetup({
  category,
  competition,
  teamName,
  teamSize,
  onSelectCompetition,
  onTeamName,
  onSelectSize,
  onNext,
}: TeamSetupProps) {
  const options = competitionsForCategory(category);
  // Group by category label (Undergraduate / Highschool) in the order they
  // first appear, so the picker never mixes them under one unlabeled list.
  const groups: { label: string; items: CompetitionConfig[] }[] = [];
  for (const c of options) {
    const group = groups.find((g) => g.label === c.categoryLabel);
    if (group) group.items.push(c);
    else groups.push({ label: c.categoryLabel, items: [c] });
  }
  const sizes = competition ? teamSizeOptions(competition) : [];
  const cfg = competition ? COMPETITIONS[competition] : null;
  const canNext = !!competition && !!teamName.trim() && teamSize != null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-lg">
      {/* Competition */}
      <section className="flex flex-col gap-4">
        <SectionLabel icon={Trophy}>Choose a Competition</SectionLabel>
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              {/* Category divider — keeps Undergraduate and Highschool
                  competitions from ever reading as one flat, unlabeled list. */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-[0.15em] text-brand-green/60">
                  {group.label}
                </span>
                <span className="h-px flex-1 bg-brand-green/15" />
              </div>

              <div className="flex flex-col gap-3">
                {group.items.map((c) => {
                  const active = competition === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectCompetition(c.id)}
                      aria-pressed={active}
                      className={cn(
                        "group relative overflow-hidden rounded-3xl p-4 text-left transition-all duration-300",
                        "bg-gradient-to-br from-white/95 to-brand-cream/60 hover:-translate-y-0.5",
                        active
                          ? "ring-2 ring-brand-lime shadow-[0_0_30px_-6px_rgba(227,239,38,0.75)]"
                          : "ring-1 ring-white/50 shadow-md hover:shadow-lg",
                      )}
                    >
                      {/* soft decorative glow */}
                      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-lime/40 to-brand-teal/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70" />

                      <div className="relative flex items-start gap-4">
                        {/* competition logo */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-white/60 overflow-hidden p-1.5">
                          <span className="relative block h-full w-full">
                            <Image
                              src={c.logo}
                              alt={`${c.name} logo`}
                              fill
                              sizes="56px"
                              className="object-contain"
                            />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-lg font-extrabold" style={titleGradient}>
                              {c.name}
                            </h3>
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all",
                                active
                                  ? "bg-gradient-to-br from-brand-lime to-brand-cream scale-100"
                                  : "scale-0",
                              )}
                            >
                              <Check className="h-4 w-4 stroke-[3] text-brand-teal" />
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <Pill>{c.minSize}–{c.maxSize} members</Pill>
                          </div>
                          <p className="mt-2 text-xs font-medium leading-relaxed text-brand-green/70">
                            {c.blurb}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team name */}
      <section className="flex flex-col gap-3">
        <SectionLabel icon={Users}>Team Name</SectionLabel>
        <RegistrationInput
          icon={Users}
          placeholder="Enter your team name"
          value={teamName}
          onChange={(e) => onTeamName(e.target.value)}
        />
      </section>

      {/* Team size */}
      <section className="flex flex-col gap-3">
        <SectionLabel icon={Users}>
          Team Size
          <span className="ml-2 text-xs font-semibold text-brand-green/60">
            {cfg ? `including leader · ${cfg.minSize}–${cfg.maxSize}` : "pick a competition first"}
          </span>
        </SectionLabel>
        <div className="flex flex-wrap gap-3">
          {sizes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-green/25 px-4 py-3 text-xs font-semibold text-brand-green/50">
              Select a competition to choose your team size.
            </div>
          )}
          {sizes.map((n) => {
            const active = teamSize === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onSelectSize(n)}
                aria-pressed={active}
                className={cn(
                  "relative h-16 w-16 rounded-2xl text-2xl font-black transition-all duration-300",
                  active
                    ? "scale-105 bg-gradient-to-br from-brand-lime to-brand-cream text-brand-teal shadow-[0_8px_20px_-6px_rgba(227,239,38,0.8)] ring-2 ring-brand-lime"
                    : "bg-white/70 text-brand-green/80 ring-1 ring-white/60 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md",
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="px-10 py-2.5 rounded-2xl bg-gradient-to-r from-brand-lime to-brand-cream text-brand-teal font-bold text-sm tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green">
      {children}
    </span>
  );
}
