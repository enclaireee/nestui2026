import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPETITIONS } from "@/lib/registrations/config";
import type {
  AdminRegistration,
  AdminSubmissionDetail,
  MemberRow,
} from "@/lib/admin/types";
import { setRegistrationStatus, setSubmissionStatus } from "@/app/admin/actions";
import { DeleteTeamButton } from "@/components/admin/delete-team-button";
import { StatusBadge } from "@/components/status-badge";

export default async function RegistrationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admin_registrations_detail")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const reg = data as AdminRegistration | null;
  if (!reg) notFound();

  const cfg = COMPETITIONS[reg.competition];

  // Every submission for this team — Entry 1 (inline) + resubmissions. If the
  // submissions view isn't present yet, fall back to the inline Entry 1 so the
  // page still works.
  const { data: subData } = await supabase
    .from("admin_submissions_detail")
    .select("*")
    .eq("registration_id", id)
    .order("entry_no", { ascending: true });
  const entries: AdminSubmissionDetail[] =
    (subData as AdminSubmissionDetail[] | null)?.length
      ? (subData as AdminSubmissionDetail[])
      : [primaryEntryFrom(reg)];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-white/60 hover:text-brand-lime">
        ← Back to all registrations
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{reg.team_name}</h1>
          <p className="font-mono text-sm text-white/60">
            {reg.code} · {cfg?.name ?? reg.competition} · {reg.team_size} members ·{" "}
            {entries.length} submission{entries.length === 1 ? "" : "s"}
          </p>
        </div>
        <DeleteTeamButton
          id={reg.id}
          teamName={reg.team_name}
          memberCount={reg.members.length}
        />
      </div>

      <Section title="Team Leader">
        <PersonCard person={leaderAsMember(reg)} hasMajor={cfg?.hasMajor ?? false} labels={cfg} />
      </Section>

      {reg.members.length > 0 && (
        <Section title="Members">
          <div className="grid gap-4 md:grid-cols-2">
            {reg.members.map((m) => (
              <PersonCard key={m.id} person={m} hasMajor={cfg?.hasMajor ?? false} labels={cfg} />
            ))}
          </div>
        </Section>
      )}

      <Section title={`Submissions (${entries.length})`}>
        <div className="flex flex-col gap-3">
          {entries.map((e) => (
            <SubmissionCard key={e.submission_id} entry={e} registrationId={reg.id} />
          ))}
          <p className="text-xs text-white/40">
            Each submission is reviewed separately — set a status per entry.
          </p>
        </div>
      </Section>
    </div>
  );
}

// Entry 1 lives inline on the registration; shape it like a submissions-view row
// so the card renders it identically to Entry 2+.
function primaryEntryFrom(reg: AdminRegistration): AdminSubmissionDetail {
  return {
    submission_id: reg.id,
    registration_id: reg.id,
    code: reg.code,
    team_name: reg.team_name,
    competition: reg.competition,
    leader_email: reg.leader_email,
    is_primary: true,
    entry_no: 1,
    payment_proof_url: reg.payment_proof_url,
    submission_url: reg.submission_url,
    status: reg.status,
    submitted_at: reg.submitted_at,
  };
}

function SubmissionCard({
  entry,
  registrationId,
}: {
  entry: AdminSubmissionDetail;
  registrationId: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold">
            Entry {entry.entry_no}
          </span>
          <span className="text-xs text-white/50">
            {new Date(entry.submitted_at).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={entry.status} />
          <StatusForm entry={entry} registrationId={registrationId} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        <LinkRow label="Payment proof" href={entry.payment_proof_url} />
        <LinkRow label="Submission" href={entry.submission_url} />
      </div>
    </div>
  );
}

function leaderAsMember(reg: AdminRegistration): MemberRow {
  return {
    id: "leader",
    registration_id: reg.id,
    member_index: 0,
    name: reg.leader_name,
    email: reg.leader_email,
    phone: reg.leader_phone,
    student_id: reg.leader_student_id,
    institution: reg.leader_institution,
    major: reg.leader_major,
    confirmation_url: reg.leader_confirmation_url,
  };
}

function StatusForm({
  entry,
  registrationId,
}: {
  entry: AdminSubmissionDetail;
  registrationId: string;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const status = String(formData.get("status"));
        // Entry 1's status lives on the registration; Entry 2+ on the submission.
        if (entry.is_primary) await setRegistrationStatus(registrationId, status);
        else await setSubmissionStatus(entry.submission_id, status, registrationId);
      }}
      className="flex items-center gap-2"
    >
      <select
        name="status"
        defaultValue={entry.status}
        className="h-9 rounded-lg border border-white/15 bg-brand-green px-2 text-sm text-white"
      >
        <option value="pending">pending</option>
        <option value="verified">verified</option>
        <option value="rejected">rejected</option>
      </select>
      <button className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">
        Update
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 p-5">
      <h2 className="mb-4 text-lg font-bold text-brand-lime">{title}</h2>
      {children}
    </section>
  );
}

function PersonCard({
  person,
  hasMajor,
  labels,
}: {
  person: MemberRow;
  hasMajor: boolean;
  labels?: { studentIdLabel: string; institutionLabel: string };
}) {
  return (
    <div className="rounded-lg bg-white/5 p-4 text-sm">
      <p className="text-base font-bold">{person.name}</p>
      <Field label="Email" value={person.email} />
      <Field label="Phone" value={person.phone} />
      <Field label={labels?.studentIdLabel ?? "Student ID"} value={person.student_id} />
      <Field label={labels?.institutionLabel ?? "Institution"} value={person.institution} />
      {hasMajor && <Field label="Major" value={person.major ?? "—"} />}
      <div className="mt-1">
        <LinkRow label="Confirmation" href={person.confirmation_url} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-white/80">
      <span className="text-white/50">{label}:</span> {value}
    </p>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <p className="text-white/80">
      <span className="text-white/50">{label}:</span>{" "}
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
