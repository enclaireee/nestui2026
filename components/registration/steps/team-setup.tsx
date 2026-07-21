"use client";

import Image from "next/image";
import { Users, Check, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegistrationInput } from "../registration-input";
import { SectionLabel } from "../section-label";
import {
  competitionsForCategory,
  currentFee,
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
    <div className="flex w-full flex-col gap-8">
      <section className="flex flex-col gap-4">
        <SectionLabel icon={Trophy}>Choose a Competition</SectionLabel>
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              {/* Category divider — keeps Undergraduate and Highschool
                  competitions from ever reading as one flat, unlabeled list. */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand-cream/45">
                  {group.label}
                </span>
                <span className="h-px flex-1 bg-brand-cream/12" />
              </div>

              <div className="flex flex-col gap-3">
                {group.items.map((c) => {
                  const active = competition === c.id;
                  // A competition drops out of the picker once its last fee tier
                  // lapses — surfaced here instead of as a server rejection after
                  // all 36 fields are filled.
                  const fee = currentFee(c.id);
                  const disabled = !fee;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => !disabled && onSelectCompetition(c.id)}
                      disabled={disabled}
                      aria-pressed={active}
                      className={cn(
                        // Dark option cards, to match the wizard surface they
                        // now sit on. Selection is carried by a lime ring +
                        // tinted fill rather than by a glow, which at this size
                        // just smeared into the neighbouring card.
                        "group relative overflow-hidden rounded-xl p-4 text-left transition-colors duration-150",
                        disabled && "cursor-not-allowed opacity-45",
                        "border",
                        active
                          ? "border-brand-lime bg-brand-lime/[0.10]"
                          : "border-brand-cream/15 bg-brand-cream/[0.05]",
                        !disabled && !active && "hover:border-brand-cream/30 hover:bg-brand-cream/[0.09]",
                      )}
                    >
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center">
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
                            <h3 className="truncate text-lg font-bold text-brand-cream">
                              {c.name}
                            </h3>
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform",
                                active ? "scale-100 bg-brand-lime" : "scale-0",
                              )}
                            >
                              <Check className="h-4 w-4 stroke-[3] text-brand-green" />
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <Pill>{c.minSize}–{c.maxSize} members</Pill>
                            {disabled && (
                              <Pill tone="muted">Registration closed</Pill>
                            )}
                          </div>
                          <p className="mt-2 text-xs font-medium leading-relaxed text-brand-cream/55">
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

      <section className="flex flex-col gap-3">
        <SectionLabel icon={Users}>Team Name</SectionLabel>
        <RegistrationInput
          icon={Users}
          tone="dark"
          label="Team name"
          placeholder="Enter your team name"
          maxLength={80}
          value={teamName}
          onChange={(e) => onTeamName(e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel icon={Users}>
          Team Size
          <span className="ml-2 text-xs font-medium text-brand-cream/45">
            {cfg ? `including leader · ${cfg.minSize}–${cfg.maxSize}` : "pick a competition first"}
          </span>
        </SectionLabel>
        <div className="flex flex-wrap gap-3">
          {sizes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-cream/20 px-4 py-3 text-xs font-medium text-brand-cream/45">
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
                  "relative h-14 w-14 rounded-xl text-lg font-bold transition-colors duration-150",
                  active
                    ? "border border-brand-lime bg-brand-lime text-brand-green"
                    : "border border-brand-cream/15 bg-brand-cream/[0.06] text-brand-cream/70 hover:border-brand-cream/30 hover:bg-brand-cream/[0.12] hover:text-brand-cream",
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
          className="btn-brand px-10 py-2.5 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        tone === "muted"
          ? "bg-brand-cream/10 text-brand-cream/50"
          : "bg-brand-lime/12 text-brand-lime/90",
      )}
    >
      {children}
    </span>
  );
}
