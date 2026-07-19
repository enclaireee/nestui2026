import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPETITIONS, COMPETITION_IDS, isCompetitionId } from "@/lib/registrations/config";
import {
  sanitizeSearch,
  type AdminRegistration,
  type AdminSubmissionDetail,
} from "@/lib/admin/types";
import { DeleteTeamButton } from "@/components/admin/delete-team-button";
import { StatusBadge } from "@/components/status-badge";

const PAGE_SIZE = 20;

type ViewMode = "teams" | "submissions";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; competition?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const view: ViewMode = sp.view === "submissions" ? "submissions" : "teams";
  const competition = isCompetitionId(sp.competition) ? sp.competition : null;
  const q = sanitizeSearch(sp.q ?? "");
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  // Preserve view + filters across every link on the page.
  const qs = (extra: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (view !== "teams") params.set("view", view);
    if (competition) params.set("competition", competition);
    if (q) params.set("q", q);
    for (const [k, v] of Object.entries(extra)) {
      if (v === "") params.delete(k);
      else params.set(k, String(v));
    }
    const s = params.toString();
    return s ? `?${s}` : "/admin";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex w-fit gap-1 rounded-xl bg-white/5 p-1">
        <ModeTab href={qs({ view: "teams", page: 1 })} active={view === "teams"} label="Teams" />
        <ModeTab
          href={qs({ view: "submissions", page: 1 })}
          active={view === "submissions"}
          label="Submissions"
        />
      </div>

      {/* Competition tabs */}
      <div className="flex flex-wrap gap-2">
        <Tab href={qs({ competition: "", page: 1 })} active={!competition} label="All" />
        {COMPETITION_IDS.map((id) => (
          <Tab
            key={id}
            href={qs({ competition: id, page: 1 })}
            active={competition === id}
            label={COMPETITIONS[id].name}
          />
        ))}
      </div>

      {/* Search + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form method="get" className="flex gap-2">
          {view !== "teams" && <input type="hidden" name="view" value={view} />}
          {competition && <input type="hidden" name="competition" value={competition} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search team, code, or leader email"
            className="h-10 w-72 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
          />
          <button className="rounded-lg bg-white/10 px-4 text-sm font-semibold hover:bg-white/20">
            Search
          </button>
        </form>

        <a
          href={`/admin/export${competition ? `?competition=${competition}` : ""}`}
          className="btn-brand px-4 py-2 text-sm"
        >
          Export CSV{competition ? ` · ${COMPETITIONS[competition].name}` : " · All"}
        </a>
      </div>

      {view === "teams" ? (
        <TeamsTable competition={competition} q={q} page={page} qs={qs} />
      ) : (
        <SubmissionsTable competition={competition} q={q} page={page} qs={qs} />
      )}
    </div>
  );
}

// ── Teams mode ───────────────────────────────────────────────────────────────
// One row per team, no per-submission detail — click through for submissions.

async function TeamsTable({
  competition,
  q,
  page,
  qs,
}: {
  competition: string | null;
  q: string;
  page: number;
  qs: (extra: Record<string, string | number>) => string;
}) {
  const from = (page - 1) * PAGE_SIZE;
  const supabase = createAdminClient();

  let query = supabase
    .from("admin_registrations_detail")
    .select("*", { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (competition) query = query.eq("competition", competition);
  if (q)
    query = query.or(
      `team_name.ilike."%${q}%",code.ilike."%${q}%",leader_email.ilike."%${q}%"`,
    );

  const { data, count, error } = await query;
  const rows = (data as AdminRegistration[] | null) ?? [];
  const total = count ?? 0;

  // Total submissions per team (Entry 1 + resubmissions) for the visible page.
  // Falls back to 1 if the submissions view isn't present yet — Entry 1 always
  // exists inline on the registration.
  const entryCount = new Map<string, number>();
  if (rows.length) {
    const { data: subs } = await supabase
      .from("admin_submissions_detail")
      .select("registration_id")
      .in(
        "registration_id",
        rows.map((r) => r.id),
      );
    for (const s of (subs as { registration_id: string }[] | null) ?? [])
      entryCount.set(s.registration_id, (entryCount.get(s.registration_id) ?? 0) + 1);
  }

  return (
    <>
      {error && <p className="text-sm text-red-400">Failed to load: {error.message}</p>}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <Th>Code</Th>
              <Th>Team</Th>
              <Th>Competition</Th>
              <Th>Members</Th>
              <Th>Leader Email</Th>
              <Th>Leader Phone</Th>
              <Th>Submissions</Th>
              <Th>Registered</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-white/50">
                  No registrations found.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/registrations/${r.id}`} className="hover:text-brand-lime">
                    {r.code}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/admin/registrations/${r.id}`} className="hover:text-brand-lime">
                    {r.team_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{COMPETITIONS[r.competition]?.name ?? r.competition}</td>
                <td className="px-4 py-3">{r.team_size}</td>
                <td className="px-4 py-3 text-white/70">
                  <a href={`mailto:${r.leader_email}`} className="hover:text-brand-lime">
                    {r.leader_email}
                  </a>
                </td>
                <td className="px-4 py-3 text-white/70">{r.leader_phone}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/registrations/${r.id}`}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold hover:bg-white/20"
                  >
                    {entryCount.get(r.id) ?? 1}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white/70">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <DeleteTeamButton
                    id={r.id}
                    teamName={r.team_name}
                    memberCount={r.members.length}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager total={total} page={page} unit="team" qs={qs} />
    </>
  );
}

// ── Submissions mode ─────────────────────────────────────────────────────────
// Every submission across all teams, newest first. Click through to the team.

async function SubmissionsTable({
  competition,
  q,
  page,
  qs,
}: {
  competition: string | null;
  q: string;
  page: number;
  qs: (extra: Record<string, string | number>) => string;
}) {
  const from = (page - 1) * PAGE_SIZE;
  const supabase = createAdminClient();

  let query = supabase
    .from("admin_submissions_detail")
    .select("*", { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (competition) query = query.eq("competition", competition);
  if (q)
    query = query.or(
      `team_name.ilike."%${q}%",code.ilike."%${q}%",leader_email.ilike."%${q}%"`,
    );

  const { data, count, error } = await query;
  const rows = (data as AdminSubmissionDetail[] | null) ?? [];
  const total = count ?? 0;

  return (
    <>
      {error && (
        <p className="text-sm text-red-400">
          Failed to load submissions: {error.message}. Run the Step 16 SQL in BACKEND.md if you
          haven&apos;t yet.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <Th>Submitted</Th>
              <Th>Team</Th>
              <Th>Entry</Th>
              <Th>Competition</Th>
              <Th>Payment</Th>
              <Th>Submission</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                  No submissions found.
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.submission_id} className="border-t border-white/5 hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-3 text-white/70">
                  {new Date(s.submitted_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/registrations/${s.registration_id}`}
                    className="font-semibold hover:text-brand-lime"
                  >
                    {s.team_name}
                  </Link>
                  <span className="ml-2 font-mono text-xs text-white/40">{s.code}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold">
                    Entry {s.entry_no}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {COMPETITIONS[s.competition]?.name ?? s.competition}
                </td>
                <td className="px-4 py-3">
                  <LinkCell href={s.payment_proof_url} />
                </td>
                <td className="px-4 py-3">
                  <LinkCell href={s.submission_url} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager total={total} page={page} unit="submission" qs={qs} />
    </>
  );
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function Pager({
  total,
  page,
  unit,
  qs,
}: {
  total: number;
  page: number;
  unit: string;
  qs: (extra: Record<string, string | number>) => string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex items-center justify-between text-sm text-white/60">
      <span>
        {total} {unit}
        {total === 1 ? "" : "s"} · page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={qs({ page: page - 1 })} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">
            Previous
          </Link>
        )}
        {page < pageCount && (
          <Link href={qs({ page: page + 1 })} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">
            Next
          </Link>
        )}
      </div>
    </div>
  );
}

function ModeTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        "rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors " +
        (active ? "bg-brand-lime text-brand-teal" : "text-white/70 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </Link>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors " +
        (active ? "bg-brand-lime text-brand-teal" : "bg-white/10 text-white/80 hover:bg-white/20")
      }
    >
      {label}
    </Link>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

// Compact clickable link cell — truncates long Google-Drive URLs, full URL on hover.
function LinkCell({ href }: { href: string }) {
  if (!href) return <span className="text-white/30">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className="block max-w-[12rem] truncate text-brand-lime hover:underline"
    >
      {href}
    </a>
  );
}
