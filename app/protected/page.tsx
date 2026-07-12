import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { COMPETITIONS } from "@/lib/registrations/config";
import type { AdminRegistration, MemberRow, SubmissionRow } from "@/lib/admin/types";
import { StatusBadge } from "@/components/status-badge";

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

async function DashboardContent() {
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
  if (registrations.length) {
    const ids = registrations.map((r) => r.id);

    const { data: members } = await supabase
      .from("team_members")
      .select("*")
      .in("registration_id", ids)
      .order("member_index");
    for (const m of (members as MemberRow[] | null) ?? []) {
      const list = membersByReg.get(m.registration_id) ?? [];
      list.push(m);
      membersByReg.set(m.registration_id, list);
    }

    // `submissions` may not exist until the Step 15 migration is run — tolerate its absence.
    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .in("registration_id", ids);
    for (const s of (subs as SubmissionRow[] | null) ?? []) {
      const list = subsByReg.get(s.registration_id) ?? [];
      list.push(s);
      subsByReg.set(s.registration_id, list);
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

      {registrations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-10">
          {registrations.map((reg) => (
            <div key={reg.id} className="flex flex-col gap-4">
              <TeamCard reg={reg} members={membersByReg.get(reg.id) ?? []} />
              <Submissions
                registrationId={reg.id}
                entries={buildEntries(reg, subsByReg.get(reg.id) ?? [])}
              />
            </div>
          ))}
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
        className="rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-6 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
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
      {/* Team header */}
      <div className="flex items-center gap-4 border-b border-white/10 p-6">
        {cfg && (
          <div
            className="relative h-14 w-14 shrink-0 rounded-xl p-2 ring-1 ring-white/10"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(var(--brand-teal-mid),0.5), rgba(var(--brand-green),0.9))",
            }}
          >
            <Image src={cfg.logo} alt={`${cfg.name} logo`} fill sizes="56px" className="object-contain p-2" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white">{reg.team_name}</h2>
          <p className="mt-0.5 text-sm text-white/55">
            {cfg?.name ?? reg.competition} · <span className="font-mono text-white/70">{reg.code}</span>
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="border-b border-white/10 p-6">
        <h3 className="mb-3 text-sm font-bold text-brand-lime">Team members</h3>
        <ul className="flex flex-col gap-2">
          <MemberRowView name={reg.leader_name} email={reg.leader_email} leader />
          {members.map((m) => (
            <MemberRowView key={m.id} name={m.name} email={m.email} />
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="p-6">
        <h3 className="mb-3 text-sm font-bold text-brand-lime">Contact person</h3>
        <p className="font-semibold text-white">{reg.leader_name}</p>
        <p className="mt-0.5 text-sm text-white/60">
          <a href={`mailto:${reg.leader_email}`} className="hover:text-brand-lime">
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
        <p className="truncate text-xs text-white/45">{email}</p>
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Submissions</h2>
        <Link
          href={`/protected/resubmit/${registrationId}`}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2 text-sm font-bold text-brand-teal shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Submit again
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {entries.map((e, i) => (
          <EntryCard key={e.key} entry={e} index={i + 1} />
        ))}
      </div>

      <p className="mt-3 text-xs text-white/40">
        Each submission needs its own paid fee and is reviewed separately.
      </p>
    </div>
  );
}

function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          Submission {index}
          <span className="ml-2 text-xs font-normal text-white/40">
            {new Date(entry.submittedAt).toLocaleDateString()}
          </span>
        </p>
        <StatusBadge status={entry.status} />
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        <LinkRow label="Payment proof" href={entry.paymentUrl} />
        <LinkRow label="Submission" href={entry.submissionUrl} />
      </div>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <p className="text-white/80">
      <span className="text-white/45">{label}:</span>{" "}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-brand-lime hover:underline"
        >
          {href}
        </a>
      ) : (
        <span className="text-white/40">—</span>
      )}
    </p>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div className="py-12 text-sm text-white/55">Loading…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
