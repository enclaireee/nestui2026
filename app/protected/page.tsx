import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  COMPETITIONS,
  FINAL_PPT_DEADLINE,
  finalPhase,
  isFinalistTeam,
  paperPhase,
} from "@/lib/registrations/config";
import type {
  AdminRegistration,
  MemberRow,
  PaperSubmissionRow,
  PresentationSubmissionRow,
  SubmissionRow,
} from "@/lib/admin/types";
import { StatusBadge } from "@/components/status-badge";
import { LinkRow } from "@/components/link-row";
import { Reveal } from "@/components/reveal";
import { GENERAL_CONTACT } from "@/lib/contacts";

// The plain `registrations` table row (unlike admin_registrations_detail) has no `members` join.
type Registration = Omit<AdminRegistration, "members">;

// A submission as shown to the team: the inline registration submission (Entry 1)
// and every `submissions` row (Entry 2+) flattened to one shape.
type Entry = {
  key: string;
  paymentUrl: string;
  submissionUrl: string;
  status: string;
  submittedAt: string;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const firstWord = (s: string) => s.trim().split(/\s+/)[0];

function buildEntries(reg: Registration, extra: SubmissionRow[]): Entry[] {
  const primary: Entry = {
    key: `${reg.id}:primary`,
    paymentUrl: reg.payment_proof_url,
    submissionUrl: reg.submission_url,
    status: reg.status,
    submittedAt: reg.submitted_at,
  };
  const rest = extra
    .slice()
    .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at))
    .map((s) => ({
      key: s.id,
      paymentUrl: s.payment_proof_url,
      submissionUrl: s.submission_url,
      status: s.status,
      submittedAt: s.submitted_at,
    }));
  return [primary, ...rest];
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; paper?: string; ppt?: string }>;
}) {
  const sp = await searchParams;
  const submitted = sp.submitted === "1";
  const paperSubmitted = sp.paper === "1";
  const pptSubmitted = sp.ppt === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // RLS scopes every query below to this user's own rows.
  const { data: regs } = await supabase
    .from("registrations")
    .select("*")
    .order("submitted_at", { ascending: false });
  const registrations = (regs as Registration[] | null) ?? [];

  const membersByReg = new Map<string, MemberRow[]>();
  const subsByReg = new Map<string, SubmissionRow[]>();
  const paperByReg = new Map<string, PaperSubmissionRow>();
  const presentationByReg = new Map<string, PresentationSubmissionRow>();

  if (registrations.length) {
    const ids = registrations.map((r) => r.id);

    // Independent queries — no reason to pay round-trips in series.
    // `submissions`, `paper_submissions`, and `presentation_submissions`
    // degrade gracefully if migrations have not run yet.
    const [{ data: members }, { data: subs }, { data: papers }, { data: ppts }] = await Promise.all([
      supabase.from("team_members").select("*").in("registration_id", ids).order("member_index"),
      supabase.from("submissions").select("*").in("registration_id", ids),
      supabase.from("paper_submissions").select("*").in("registration_id", ids),
      supabase.from("presentation_submissions").select("*").in("registration_id", ids),
    ]);

    for (const m of (members as MemberRow[] | null) ?? []) {
      const list = membersByReg.get(m.registration_id) ?? [];
      list.push(m);
      membersByReg.set(m.registration_id, list);
    }

    for (const s of (subs as SubmissionRow[] | null) ?? []) {
      const list = subsByReg.get(s.registration_id) ?? [];
      list.push(s);
      subsByReg.set(s.registration_id, list);
    }

    for (const pp of (papers as PaperSubmissionRow[] | null) ?? []) {
      paperByReg.set(pp.registration_id, pp);
    }

    for (const pt of (ppts as PresentationSubmissionRow[] | null) ?? []) {
      presentationByReg.set(pt.registration_id, pt);
    }
  }

  const greetName = registrations.length
    ? firstWord(registrations[0].leader_name)
    : firstWord((user.email ?? "there").split("@")[0]);

  return (
    <section className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-gradient-brand drop-shadow-sm sm:text-4xl">
          Welcome back, {greetName}
        </h1>
        <p className="mt-1.5 text-sm text-white/55">
          {registrations.length
            ? "Your team and submissions."
            : "Register a team to get started."}
        </p>
      </header>

      {submitted && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 px-4 py-3 text-sm font-semibold text-brand-lime"
        >
          <Check className="h-4 w-4 shrink-0 stroke-[3]" />
          Submission received. It&apos;s listed below and now waiting for review.
        </p>
      )}

      {paperSubmitted && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 px-4 py-3 text-sm font-semibold text-brand-lime"
        >
          <Check className="h-4 w-4 shrink-0 stroke-[3]" />
          Paper received. It&apos;s listed below and now waiting for review.
        </p>
      )}

      {pptSubmitted && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 px-4 py-3 text-sm font-semibold text-brand-lime"
        >
          <Check className="h-4 w-4 shrink-0 stroke-[3]" />
          Presentation deck received. It&apos;s listed below and ready for the Grand Final review.
        </p>
      )}

      {registrations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-10">
          {registrations.map((reg) => {
            const isFinalist = isFinalistTeam(reg.code, reg.is_finalist);
            return (
              <div key={reg.id} className="flex flex-col gap-4">
                <TeamCard reg={reg} members={membersByReg.get(reg.id) ?? []} />
                {isFinalist && (
                  <FinalistRound
                    reg={reg}
                    presentation={presentationByReg.get(reg.id) ?? null}
                  />
                )}
                <PaperRound
                  reg={reg}
                  paper={paperByReg.get(reg.id) ?? null}
                  isFinalist={isFinalist}
                />
                <Submissions
                  registrationId={reg.id}
                  entries={buildEntries(reg, subsByReg.get(reg.id) ?? [])}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <div>
        <p className="text-base font-semibold text-white">No team yet</p>
        <p className="mt-1 max-w-sm text-sm text-white/55">
          Pick a competition and set up your team. Your submissions will show up here.
        </p>
      </div>
      <Link
        href="/branding/registration"
        className="btn-brand px-6 py-2.5 text-sm"
      >
        Register a team
      </Link>
    </div>
  );
}

function TeamCard({ reg, members }: { reg: Registration; members: MemberRow[] }) {
  const cfg = COMPETITIONS[reg.competition];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-4 border-b border-white/10 p-5 sm:p-6">
        {cfg && (
          <div className="relative h-14 w-14 shrink-0">
            <Image src={cfg.logo} alt={`${cfg.name} logo`} fill sizes="56px" className="object-contain" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white">{reg.team_name}</h2>
          <p className="mt-0.5 text-sm text-white/55">
            {cfg?.name ?? reg.competition} · <span className="font-mono text-white/70">{reg.code}</span>
          </p>
        </div>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <h3 className="mb-3 text-sm font-bold text-brand-lime">Team members</h3>
        <ul className="flex flex-col gap-2">
          <MemberRowView name={reg.leader_name} email={reg.leader_email} leader />
          {members.map((m) => (
            <MemberRowView key={m.id} name={m.name} email={m.email} />
          ))}
        </ul>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="mb-3 text-sm font-bold text-brand-lime">Contact person</h3>
        <p className="font-semibold text-white">{reg.leader_name}</p>
        <p className="mt-0.5 text-sm text-white/60">
          <a href={`mailto:${reg.leader_email}`} className="inline-flex min-h-11 items-center break-all hover:text-brand-lime">
            {reg.leader_email}
          </a>{" "}
          · {reg.leader_phone}
        </p>
      </div>
    </div>
  );
}

function MemberRowView({
  name,
  email,
  leader = false,
}: {
  name: string;
  email: string;
  leader?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/80">
        {initials(name) || "?"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium text-white">
          <span className="truncate">{name}</span>
          {leader && (
            <span className="shrink-0 rounded-full bg-brand-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-lime">
              Leader
            </span>
          )}
        </p>
        <p className="truncate text-xs text-white/55">{email}</p>
      </div>
    </li>
  );
}

function Submissions({
  registrationId,
  entries,
}: {
  registrationId: string;
  entries: Entry[];
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Submissions</h2>
        <Link
          href={`/protected/resubmit/${registrationId}`}
          className="btn-brand px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Submit again
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {entries.map((e, i) => (
          <EntryCard key={e.key} entry={e} index={i + 1} />
        ))}
      </div>

      <p className="mt-3 text-xs text-white/55">
        Each submission needs its own paid fee and is reviewed separately.
      </p>
    </div>
  );
}

const WIB_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
};

function FinalistRound({
  reg,
  presentation,
}: {
  reg: Registration;
  presentation: PresentationSubmissionRow | null;
}) {
  const phase = finalPhase();
  const submitted = Boolean(presentation);
  const deadlineStr = new Date(FINAL_PPT_DEADLINE).toLocaleDateString("en-GB", WIB_DATE);

  return (
    <Reveal className="overflow-hidden rounded-2xl border border-brand-lime/40 bg-brand-lime/[0.08] shadow-[0_0_35px_rgba(209,255,0,0.08)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-brand-lime px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-teal">
                Finalist
              </span>
              <h2 className="text-gradient-brand text-2xl font-bold leading-tight sm:text-3xl drop-shadow-[0_2px_12px_rgb(var(--brand-lime)/0.3)]">
                Grand Final (H-3)
              </h2>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
              <FileText className="h-4 w-4 shrink-0 text-brand-lime" />
              Presentation Deck (PPT / Google Slides)
            </p>
          </div>
          {presentation ? (
            <StatusBadge status={presentation.status} />
          ) : (
            <span className="rounded-full border border-brand-lime/30 bg-brand-lime/10 px-3 py-1 text-xs font-semibold text-brand-lime">
              Awaiting Upload
            </span>
          )}
        </div>

        {!submitted && phase !== "closed" && (
          <p className="mt-4 text-base leading-relaxed text-white/90">
            <span className="font-bold text-brand-lime">Congratulations!</span> Your team has officially advanced to the Grand Final of NEST 2026. Please upload your presentation deck (Google Drive / Google Slides link) by{" "}
            <span className="font-semibold text-white">{deadlineStr}, 23:59 WIB</span>.
          </p>
        )}

        {submitted && (
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Presentation deck received on{" "}
            <span className="font-medium text-white">
              {new Date(presentation!.submitted_at).toLocaleDateString("en-GB", WIB_DATE)}
            </span>
            {presentation!.updated_at !== presentation!.submitted_at && " · replaced since"}. We look forward to your presentation at the Main Event on 3 October 2026!
          </p>
        )}

        {phase === "closed" && !submitted && (
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Presentation submission closed on {deadlineStr}, 23:59 WIB. If you need assistance, please contact {GENERAL_CONTACT.email}.
          </p>
        )}

        {presentation && (
          <div className="mt-4 flex flex-col gap-1.5 text-sm">
            <LinkRow label="Presentation deck (PPT / Slides)" href={presentation.ppt_url} />
          </div>
        )}

        {phase === "open" &&
          (submitted ? (
            <Link
              href={`/protected/presentation/${reg.id}`}
              className="mt-4 inline-flex min-h-11 w-fit items-center text-sm font-semibold text-white/70 underline underline-offset-4 transition-colors hover:text-brand-lime"
            >
              Replace presentation deck
            </Link>
          ) : (
            <Link
              href={`/protected/presentation/${reg.id}`}
              className="btn-brand mt-5 inline-flex w-fit items-center gap-2 px-6 py-2.5 text-sm shadow-lg shadow-brand-lime/20"
            >
              Submit presentation (PPT)
            </Link>
          ))}
      </div>
    </Reveal>
  );
}

// The round that follows selection. Only rendered for competitions that have
// one — Medhack's `paperSubmission` is null, so it never shows there.
function PaperRound({
  reg,
  paper,
  isFinalist,
}: {
  reg: Registration;
  paper: PaperSubmissionRow | null;
  isFinalist: boolean;
}) {
  const cfg = COMPETITIONS[reg.competition];
  const window = cfg?.paperSubmission;
  if (!window) return null;

  const phase = paperPhase(reg.competition);
  const cleared = reg.status === "verified";
  const deliverable = window.video ? "full paper and video" : "full paper";
  const opens = new Date(`${window.opens}T00:00:00+07:00`).toLocaleDateString("en-GB", WIB_DATE);
  const closes = new Date(`${window.closes}T23:59:59+07:00`).toLocaleDateString("en-GB", WIB_DATE);

  // Once the paper is in, the card stops celebrating and becomes a receipt.
  const submitted = Boolean(paper);
  const notQualified = submitted && !isFinalist;

  return (
    <Reveal className="overflow-hidden rounded-2xl border border-brand-lime/25 bg-brand-lime/[0.04]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2
            className={`text-gradient-brand text-2xl font-bold leading-tight sm:text-3xl ${
              submitted ? "" : "drop-shadow-[0_2px_12px_rgb(var(--brand-lime)/0.25)]"
            }`}
          >
            Semifinal
          </h2>
          {paper && (
            <StatusBadge
              status={isFinalist ? "verified" : paper.status === "verified" ? "verified" : "rejected"}
            />
          )}
        </div>

        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/70">
          <FileText className="h-4 w-4 shrink-0 text-brand-lime" />
          {window.video ? "Full paper & video" : "Full paper"}
        </p>

        {/* Congratulations only before submitting — afterwards this is a receipt. */}
        {!submitted && phase !== "closed" && (
          <p className="mt-4 text-base leading-relaxed text-white/80">
            {cleared ? (
              <>
                <span className="font-bold text-brand-lime">Congratulations</span> — you&apos;re
                through to the semifinal.{" "}
              </>
            ) : null}
            {phase === "before"
              ? `Submission for your ${deliverable} opens ${opens}.`
              : `Submit your ${deliverable} by ${closes}, 23:59 WIB.`}
          </p>
        )}

        {submitted && isFinalist && (
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Received{" "}
            {new Date(paper!.submitted_at).toLocaleDateString("en-GB", WIB_DATE)}
            {paper!.updated_at !== paper!.submitted_at && " · replaced since"}.{" "}
            <span className="font-semibold text-brand-lime">Verified</span> — your team has advanced to the Grand Final!
          </p>
        )}

        {submitted && notQualified && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm leading-relaxed text-white/60">
              Received{" "}
              {new Date(paper!.submitted_at).toLocaleDateString("en-GB", WIB_DATE)}
              {paper!.updated_at !== paper!.submitted_at && " · replaced since"}.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm leading-relaxed text-white/75">
              <p className="font-semibold text-white/95">Grand Final Announcement</p>
              <p className="mt-1 text-white/70">
                Finalists for the Grand Final have been announced. While your team did not qualify to advance to the finals this year, the NEST 2026 committee deeply appreciates your hard work, dedication, and participation. If you need a participation certificate or have any questions, please contact{" "}
                <a href={`mailto:${GENERAL_CONTACT.email}`} className="text-brand-lime underline">
                  {GENERAL_CONTACT.email}
                </a>.
              </p>
            </div>
          </div>
        )}

        {phase === "closed" && !submitted && (
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Submission closed {closes}, 23:59 WIB. Nothing was received from your team — email{" "}
            {GENERAL_CONTACT.email} if that&apos;s wrong.
          </p>
        )}

        {paper && (
          <div className="mt-4 flex flex-col gap-1.5 text-sm">
            <LinkRow label="Full paper" href={paper.paper_url} />
            {window.video && <LinkRow label="Video" href={paper.video_url ?? ""} />}
          </div>
        )}

        {phase === "open" &&
          (submitted ? (
            <Link
              href={`/protected/paper/${reg.id}`}
              className="mt-4 inline-flex min-h-11 w-fit items-center text-sm font-semibold text-white/55 underline underline-offset-4 transition-colors hover:text-brand-lime"
            >
              Replace paper
            </Link>
          ) : (
            <Link href={`/protected/paper/${reg.id}`} className="btn-brand mt-5 w-fit px-6 py-2.5 text-sm">
              Submit {window.video ? "paper & video" : "paper"}
            </Link>
          ))}

        {phase === "before" && !submitted && (
          <p className="mt-3 text-xs text-white/45">
            The form opens here once the window starts.
          </p>
        )}
      </div>
    </Reveal>
  );
}

// A bare status word tells a participant nothing about what happens next, and
// "rejected" with no explanation and no route forward is the worst of the three.
const STATUS_HELP: Record<string, string> = {
  pending:
    "Our team is checking your payment and submission links. No action needed — we'll contact the leader by WhatsApp if anything is unclear.",
  verified: "Payment and submission confirmed. You're in — see you in the WhatsApp group.",
  rejected: `Something didn't check out — usually an unreadable transfer receipt or a Drive link that isn't shared publicly. Email ${GENERAL_CONTACT.email} and we'll sort it out, or submit again below.`,
};

function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const help = STATUS_HELP[entry.status];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          Submission {index}
          <span className="ml-2 text-xs font-normal text-white/55">
            {new Date(entry.submittedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </p>
        <StatusBadge status={entry.status} />
      </div>

      {help && (
        <p
          className={`mt-2 text-xs leading-relaxed ${
            entry.status === "rejected" ? "text-red-200/80" : "text-white/50"
          }`}
        >
          {help}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        <LinkRow label="Payment proof" href={entry.paymentUrl} />
        <LinkRow label="Submission" href={entry.submissionUrl} />
      </div>
    </div>
  );
}

export default function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; paper?: string; ppt?: string }>;
}) {
  // The promise is handed down rather than awaited here: awaiting it in the
  // page body would put request-time data outside the boundary and block the
  // whole route from prerendering.
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

// Matches the real layout's shape and spacing so the swap doesn't jump.
function DashboardSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-64 rounded-lg bg-white/10" />
        <div className="h-4 w-40 rounded bg-white/[0.07]" />
      </div>
      <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]" />
      <div className="flex flex-col gap-3">
        <div className="h-6 w-32 rounded bg-white/10" />
        <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}
