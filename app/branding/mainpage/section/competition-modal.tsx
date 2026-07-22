"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ArrowRight,
  BookOpen,
  Trophy,
  CalendarDays,
  Wallet,
  Layers,
  Phone,
  Users,
} from "lucide-react";
import { COMPETITIONS, currentFee, type CompetitionId } from "@/lib/registrations/config";
import { COMPETITION_CONTACTS, waLink } from "@/lib/contacts";
import { formatIDR } from "@/lib/payment";

// Detail copy for each competition, extracted from the NEST UI 2026 guidebook
// design briefs. Only the entrant-facing marketing copy lives here — the
// functional config (team sizes, field variations) stays in lib/registrations.
// Grand theme + subthemes live in the "Our Theme" section, not per-competition.

interface Stage {
  name: string;
  desc: string;
}
interface TimelineItem {
  label: string;
  date: string;
  highlight?: boolean;
}
interface Prize {
  label: string;
  value: string;
  rank: 1 | 2 | 3;
}
interface CompetitionDetail {
  about: string;
  stages: Stage[];
  timeline: TimelineItem[];
  prizes: Prize[];
}

const DETAILS: Record<CompetitionId, CompetitionDetail> = {
  medhack: {
    about:
      "MedHack NEST UI 2026 is a team hackathon competition (3–5 participants) to develop technology-based business innovation in healthcare. Participants are challenged to identify problems, design a business model, and develop an innovative, applicable, and impactful digital product.",
    stages: [
      {
        name: "Preliminary",
        desc: "Proposal-based selection (depth of problem analysis, solution relevance, system feasibility) accompanied by a short video summarizing the product idea.",
      },
      {
        name: "Final",
        desc: "Digital Product Development to 100% completion with core functionality, followed by a Final Presentation with a pitch deck in front of the judging panel.",
      },
    ],
    timeline: [
      { label: "Early Bird Registration + Proposal Submission", date: "20 July – 2 August 2026", highlight: true },
      { label: "Normal Registration + Proposal Submission", date: "3 – 25 August 2026", highlight: true },
      { label: "Video Submission", date: "26 August – 4 September 2026" },
      { label: "Finalist Announcement", date: "21 September 2026" },
      { label: "Technical Meeting & Mentoring", date: "22 September 2026" },
      { label: "Final Submission", date: "23 – 29 September 2026" },
      { label: "Main Event", date: "3 October 2026" },
    ],
    prizes: [
      { label: "1st Place", value: "Rp4,500,000 + Certificate", rank: 1 },
      { label: "2nd Place", value: "Rp3,000,000 + Certificate", rank: 2 },
      { label: "3rd Place", value: "Rp2,000,000 + Certificate", rank: 3 },
    ],
  },
  healthineer: {
    about:
      "Healthineer NEST UI 2026 is a team competition (3–5 participants) to develop healthcare technology solutions in the form of a low fidelity prototype. Participants design a technology-based solution and present it in a scientific paper backed by an applicable, impactful prototype.",
    stages: [
      {
        name: "Abstract Submission",
        desc: "Initial abstract-based selection: problem identification, urgency, and an overview of the proposed innovative solution.",
      },
      {
        name: "Full Paper & Prototype Development",
        desc: "Participants develop their idea into a comprehensive scientific paper and realize it as a low fidelity prototype.",
      },
      {
        name: "Final Presentation & Exhibition",
        desc: "Finalists present their solution and prototype to the judges, and take part in an exhibition session for relevant stakeholders.",
      },
    ],
    timeline: [
      { label: "Early Bird Registration + Abstract Submission", date: "20 July – 2 August 2026", highlight: true },
      { label: "Normal Registration + Abstract Submission", date: "3 – 14 August 2026", highlight: true },
      { label: "Semifinalist Announcement", date: "29 August 2026" },
      { label: "Technical Meeting I & Mentoring I", date: "30 August 2026" },
      { label: "Full Paper Submission", date: "31 August – 13 September 2026" },
      { label: "Finalist Announcement", date: "21 September 2026" },
      { label: "Technical Meeting II & Mentoring II", date: "22 September 2026" },
      { label: "Final Submission", date: "23 – 29 September 2026" },
      { label: "Main Event", date: "3 October 2026" },
    ],
    prizes: [
      { label: "1st Place", value: "Rp4,500,000 + e-Certificate", rank: 1 },
      { label: "2nd Place", value: "Rp3,000,000 + e-Certificate", rank: 2 },
      { label: "3rd Place", value: "Rp2,000,000 + e-Certificate", rank: 3 },
    ],
  },
  healthynovation: {
    about:
      "Healthynovation is a scientific paper competition for highschool students (teams of 1–3 participants) that encourages innovative ideas to address healthcare challenges. Participants prepare a scientific paper and poster to communicate a creative, systematic, and relevant solution.",
    stages: [
      {
        name: "Preliminary",
        desc: "Abstract selection consisting of a concise summary: problem background, objectives, methodology, key findings, and conclusion.",
      },
      {
        name: "Semifinal",
        desc: "Full paper selection — the complete, expanded form of the abstract that was submitted.",
      },
      {
        name: "Final",
        desc: "Presentation at the main event, accompanied by a conference and scientific poster exhibition.",
      },
    ],
    timeline: [
      { label: "Early Bird Registration + Abstract Submission", date: "20 July – 2 August 2026", highlight: true },
      { label: "Normal Registration + Abstract Submission", date: "3 – 14 August 2026", highlight: true },
      { label: "Semifinalist Announcement", date: "29 August 2026" },
      { label: "Technical Meeting I & Mentoring I", date: "30 August 2026" },
      { label: "Full Paper Submission", date: "31 August – 13 September 2026" },
      { label: "Finalist Announcement", date: "21 September 2026" },
      { label: "Technical Meeting II & Mentoring II", date: "22 September 2026" },
      { label: "Final Submission", date: "23 – 29 September 2026" },
      { label: "Main Event", date: "3 October 2026" },
    ],
    prizes: [
      { label: "1st Place", value: "Rp3,000,000 + Certificate", rank: 1 },
      { label: "2nd Place", value: "Rp2,000,000 + Certificate", rank: 2 },
      { label: "3rd Place", value: "Rp1,000,000 + Certificate", rank: 3 },
    ],
  },
};

const RANK_STYLES: Record<1 | 2 | 3, string> = {
  1: "from-brand-butter to-amber-500 text-brand-green",
  2: "from-gray-200 to-gray-400 text-brand-green",
  3: "from-amber-600 to-amber-800 text-white",
};

export function CompetitionModal({
  competitionId,
  onClose,
}: {
  competitionId: CompetitionId | null;
  onClose: () => void;
}) {
  // Scroll lock + Esc to close while open.
  useEffect(() => {
    if (!competitionId) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKey);
    };
  }, [competitionId, onClose]);

  if (!competitionId) return null;

  const cfg = COMPETITIONS[competitionId];
  const detail = DETAILS[competitionId];
  // Safe to read the clock during render: the modal returns null until a click,
  // so this never renders on the server and can't cause a hydration mismatch.
  const activeFee = currentFee(competitionId);
  const registerHref =
    cfg.category === "sma" ? "/branding/registration/sma" : "/branding/registration";


  // A tier whose window has already closed. `currentFee` tells us which one is
  // live; anything with an earlier deadline is spent. Rendering those as
  // struck-through rather than just dimmed means the fee strip now reads as a
  // schedule — you can see what you missed and what's next, which the flat
  // "opacity-60 on everything that isn't active" version couldn't show.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${cfg.name} details`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-brand-green/95 shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="relative flex items-center gap-4 border-b border-white/10 p-6 pr-14">
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src={cfg.logo}
              alt={`${cfg.name} logo`}
              fill
              sizes="80px"
              className="object-contain drop-shadow-[0_0_14px_rgba(227,239,38,0.35)]"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-3xl font-bold text-gradient-brand">{cfg.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill icon={Users}>{cfg.categoryLabel}</Pill>
              <Pill icon={Users}>{cfg.minSize}–{cfg.maxSize} participants</Pill>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-7 [scrollbar-width:thin] [scrollbar-color:rgb(var(--brand-lime))_transparent]">
          <p className="max-w-[68ch] text-sm leading-relaxed text-white/75">{detail.about}</p>

          {/* Two columns from lg. All six sections used to stack in a single
              672px-wide scroll, which made even the short competitions a long
              drag to the register button. Same content, roughly half the
              scroll — narrative on the left, the reference numbers you scan
              for (prizes, fees, who to contact) on the right. */}
          <div className="mt-8 grid gap-8 lg:grid-cols-5 lg:gap-10">
            <div className="flex flex-col gap-8 lg:col-span-3">
              <Section icon={Layers} title="Competition Stages">
                {/* Connector line behind the numbers, so the stages read as a
                    sequence instead of two unrelated rows. */}
                <ol className="relative flex flex-col gap-5 before:absolute before:left-[17px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-white/15">
                  {detail.stages.map((st, i) => (
                    <li key={st.name} className="relative flex gap-4">
                      <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-lime to-brand-cream text-sm font-black text-brand-teal ring-4 ring-brand-green">
                        {i + 1}
                      </span>
                      <div className="pt-1">
                        <p className="font-bold text-white">{st.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/60">{st.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section icon={CalendarDays} title="Timeline">
                <ol className="relative ml-1 border-l border-white/15 pl-5">
                  {detail.timeline.map((t, i) => (
                    <li key={i} className="relative pb-4 last:pb-0">
                      <span
                        className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-brand-green ${
                          t.highlight ? "bg-brand-lime" : "bg-white/40"
                        }`}
                      />
                      <p
                        className={`text-sm font-semibold ${
                          t.highlight ? "text-brand-lime" : "text-white/85"
                        }`}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-white/50">{t.date}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-2">
              <Section icon={Trophy} title="Prize Pool">
                {/* Rank 1 gets a genuinely different treatment. Previously all
                    three prizes were identical rows distinguished only by a
                    24px badge, so the headline number didn't read as the
                    headline. */}
                <div className="flex flex-col gap-2.5">
                  {detail.prizes.map((p) => (
                    <div
                      key={p.label}
                      className={`flex items-center gap-3 rounded-2xl px-4 ring-1 ${
                        p.rank === 1
                          ? "bg-brand-lime/10 py-4 ring-brand-lime/40"
                          : "bg-white/[0.06] py-3 ring-white/10"
                      }`}
                    >
                      <span
                        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-black ${
                          RANK_STYLES[p.rank]
                        } ${p.rank === 1 ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs"}`}
                      >
                        {p.rank}
                      </span>
                      {/* Label over value, not label | value. Side-by-side in
                          a 2-of-5 column broke both halves onto two lines
                          ("1st / Place", "Rp4,500,000 + / Certificate") — the
                          prize amounts are long enough that they need the full
                          row width to themselves. */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                          {p.label}
                        </p>
                        <p
                          className={`font-bold text-brand-butter ${
                            p.rank === 1 ? "text-base" : "text-sm"
                          }`}
                        >
                          {p.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={Wallet} title="Registration Fee">
                <div className="flex flex-col gap-2">
                  {cfg.fees.map((f) => {
                    const active = f.label === activeFee?.label;
                    const past = !active && f.until < today;
                    return (
                      <div
                        key={f.label}
                        className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ring-1 ${
                          active
                            ? "bg-brand-lime/10 ring-brand-lime/50"
                            : "bg-white/[0.04] ring-white/10"
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-[11px] font-bold uppercase tracking-wide ${
                              active ? "text-brand-lime/80" : "text-white/45"
                            }`}
                          >
                            {f.label}
                            {active && " · active now"}
                            {past && " · closed"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/40">until {f.until}</p>
                        </div>
                        <p
                          className={`shrink-0 text-base font-black ${
                            active
                              ? "text-brand-lime"
                              : past
                                ? "text-white/35 line-through"
                                : "text-white/60"
                          }`}
                        >
                          {formatIDR(f.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Section>

              <Section icon={Phone} title="Contact Person">
                <div className="flex flex-col gap-2">
                  {COMPETITION_CONTACTS[competitionId].map((c) => (
                    <a
                      key={c.name}
                      href={waLink(c.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10 transition-colors hover:bg-white/12 hover:ring-brand-lime/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white">{c.name}</span>
                        <span className="block text-xs text-white/50">{c.phone}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-lime transition-transform group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>

        {/* Split footer: read first, then enter. Guidebook is the secondary
            action so it doesn't compete with Register — and it's a plain <a>,
            not next/link, because it leaves the app for Google Drive. */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4">
          <a
            href={cfg.guidebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost py-3.5 text-sm"
          >
            <BookOpen className="h-5 w-5" />
            Guidebook
          </a>
          <Link href={registerHref} className="btn-brand py-3.5 text-sm">
            Register
            <ArrowRight className="h-5 w-5 stroke-[3]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel icon={icon}>{title}</SectionLabel>
      {children}
    </section>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-lime/15">
        <Icon className="h-4 w-4 text-brand-lime" />
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.1em] text-white/90">{children}</span>
    </div>
  );
}

function Pill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white/80">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}
