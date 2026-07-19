"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ArrowRight,
  Trophy,
  CalendarDays,
  Wallet,
  Layers,
  Phone,
  Users,
} from "lucide-react";
import { COMPETITIONS, currentFee, type CompetitionId } from "@/lib/registrations/config";
import { formatIDR } from "@/lib/payment";

// ---------------------------------------------------------------------------
// Detail copy for each competition, extracted from the NEST UI 2026 guidebook
// design briefs. Only the entrant-facing marketing copy lives here — the
// functional config (team sizes, field variations) stays in lib/registrations.
// Grand theme + subthemes live in the "Our Theme" section, not per-competition.
// ---------------------------------------------------------------------------

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
  contacts: { name: string; phone: string }[];
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
      { label: "Early Bird Registration + Video & Proposal", date: "13 – 27 July 2026", highlight: true },
      { label: "Normal Registration + Video & Proposal", date: "28 July – 22 August 2026", highlight: true },
      { label: "Finalist Announcement", date: "17 September 2026" },
      { label: "Technical Meeting", date: "18 September 2026" },
      { label: "Final Submission", date: "19 – 26 September 2026" },
      { label: "Main Event", date: "3 October 2026" },
    ],
    prizes: [
      { label: "1st Place", value: "Rp4,500,000 + Certificate", rank: 1 },
      { label: "2nd Place", value: "Rp3,000,000 + Certificate", rank: 2 },
      { label: "3rd Place", value: "Rp2,000,000 + Certificate", rank: 3 },
    ],
    contacts: [
      { name: "Rahel", phone: "0887 5475 115" },
      { name: "Nadzira", phone: "0812 1288 1794" },
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
      { label: "Early Registration + Abstract", date: "13 – 19 July 2026", highlight: true },
      { label: "Normal Registration + Abstract", date: "20 – 31 July 2026", highlight: true },
      { label: "Late Registration + Abstract", date: "1 – 7 August 2026", highlight: true },
      { label: "Announcement", date: "23 August 2026" },
      { label: "Techmeet + Semifinal Mentoring", date: "24 August 2026" },
      { label: "Semifinal", date: "25 August – 8 September 2026" },
      { label: "Announcement", date: "17 September 2026" },
      { label: "Techmeet + Final Mentoring", date: "18 September 2026" },
      { label: "Final Presentation Submission", date: "19 – 26 September 2026" },
      { label: "Main Event", date: "3 October 2026" },
    ],
    prizes: [
      { label: "1st Place", value: "Rp4,500,000 + e-Certificate", rank: 1 },
      { label: "2nd Place", value: "Rp3,000,000 + e-Certificate", rank: 2 },
      { label: "3rd Place", value: "Rp2,000,000 + e-Certificate", rank: 3 },
    ],
    contacts: [
      { name: "Josia", phone: "0812 6231 4375" },
      { name: "Enders", phone: "0877 8564 0780" },
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
      { label: "Early Registration + Abstract", date: "13 – 19 July 2026", highlight: true },
      { label: "Normal Registration + Abstract", date: "20 – 31 July 2026", highlight: true },
      { label: "Late Registration + Abstract", date: "1 – 7 August 2026", highlight: true },
      { label: "Announcement", date: "23 August 2026" },
      { label: "Techmeet + Semifinal Mentoring", date: "24 August 2026" },
      { label: "Full Paper Submission", date: "25 August – 8 September 2026" },
      { label: "Announcement", date: "17 September 2026" },
      { label: "Techmeet + Final Mentoring", date: "18 September 2026" },
      { label: "Presentation Slides Submission", date: "19 – 26 September 2026" },
      { label: "Poster Submission", date: "27 – 30 September 2026" },
      { label: "Main Event", date: "3 October 2026" },
    ],
    prizes: [
      { label: "1st Place", value: "Rp3,000,000 + Certificate", rank: 1 },
      { label: "2nd Place", value: "Rp2,000,000 + Certificate", rank: 2 },
      { label: "3rd Place", value: "Rp1,000,000 + Certificate", rank: 3 },
    ],
    contacts: [
      { name: "Lita", phone: "0895 3604 48081" },
      { name: "Nicholas", phone: "0859 4739 5277" },
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${cfg.name} details`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-brand-green/95 shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-lime/20 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center gap-4 border-b border-white/10 p-6 pr-14">
          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl p-3 ring-1 ring-brand-lime/30"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(var(--brand-teal-mid),0.55), rgba(var(--brand-green),0.9))",
              boxShadow: "0 0 30px -6px rgba(227,239,38,0.35)",
            }}
          >
            <span className="relative block h-full w-full">
              <Image
                src={cfg.logo}
                alt={`${cfg.name} logo`}
                fill
                sizes="80px"
                className="object-contain drop-shadow-[0_0_14px_rgba(227,239,38,0.35)]"
              />
            </span>
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
            className="absolute right-5 top-5 text-white/60 transition-colors hover:text-white focus:outline-none"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-8 overflow-y-auto px-6 py-7 [scrollbar-width:thin] [scrollbar-color:rgb(var(--brand-lime))_transparent]">
          {/* About */}
          <p className="text-sm leading-relaxed text-white/75">{detail.about}</p>

          {/* Stages */}
          <Section icon={Layers} title="Tahapan Kompetisi">
            <div className="flex flex-col gap-3">
              {detail.stages.map((st, i) => (
                <div key={st.name} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-lime to-brand-cream text-sm font-black text-brand-teal">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{st.name}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeline */}
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

          {/* Prizes */}
          <Section icon={Trophy} title="Prize Pool">
            <div className="flex flex-col gap-2">
              {detail.prizes.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 ring-1 ring-brand-lime/25"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black bg-gradient-to-br ${RANK_STYLES[p.rank]}`}
                  >
                    {p.rank}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-white/85">{p.label}</span>
                  <span className="text-right text-sm font-bold text-brand-butter">{p.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Fees */}
          <Section icon={Wallet} title="Biaya Registrasi">
            <div className="flex flex-wrap gap-3">
              {cfg.fees.map((f) => {
                const active = f.label === activeFee?.label;
                return (
                  <div
                    key={f.label}
                    className={
                      "flex-1 min-w-[120px] rounded-2xl p-4 text-center ring-1 " +
                      (active
                        ? "bg-brand-lime/10 ring-brand-lime/50"
                        : "bg-white/5 ring-white/10 opacity-60")
                    }
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">
                      {f.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-brand-lime">
                      {formatIDR(f.amount)}
                    </p>
                    {active && (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-lime/80">
                        Berlaku sekarang
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Contacts */}
          <Section icon={Phone} title="Contact Person">
            <div className="flex flex-wrap gap-4">
              {detail.contacts.map((c) => (
                <div key={c.name} className="text-sm">
                  <span className="font-bold text-white">{c.name}</span>{" "}
                  <span className="text-white/60">· {c.phone}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-white/10 p-4">
          <Link
            href={registerHref}
            className="btn-brand w-full py-3.5 text-sm"
          >
            Daftar {cfg.name}
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
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-lime/15">
        <Icon className="h-4 w-4 text-brand-lime" />
      </span>
      <span className="text-lg font-bold text-white">{children}</span>
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
