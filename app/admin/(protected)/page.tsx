import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPETITIONS, COMPETITION_IDS, isCompetitionId } from "@/lib/registrations/config";
import { sanitizeSearch, type AdminRegistration } from "@/lib/admin/types";
import { DeleteTeamButton } from "@/components/admin/delete-team-button";

const PAGE_SIZE = 20;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const competition = isCompetitionId(sp.competition) ? sp.competition : null;
  const q = sanitizeSearch(sp.q ?? "");
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
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
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filterQS = (extra: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (competition) params.set("competition", competition);
    if (q) params.set("q", q);
    for (const [k, v] of Object.entries(extra)) params.set(k, String(v));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Competition tabs */}
      <div className="flex flex-wrap gap-2">
        <Tab href="/admin" active={!competition} label="All" />
        {COMPETITION_IDS.map((id) => (
          <Tab
            key={id}
            href={`/admin?competition=${id}`}
            active={competition === id}
            label={COMPETITIONS[id].name}
          />
        ))}
      </div>

      {/* Search + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form method="get" className="flex gap-2">
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

        <div className="flex gap-2">
          <a
            href={`/admin/export${competition ? `?competition=${competition}` : ""}`}
            className="rounded-lg bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2 text-sm font-bold text-brand-teal hover:brightness-105"
          >
            Export CSV{competition ? ` · ${COMPETITIONS[competition].name}` : " · All"}
          </a>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">Failed to load: {error.message}</p>}

      {/* Table */}
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
              <Th>Payment</Th>
              <Th>Submission</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-white/50">
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
                <td className="px-4 py-3 font-semibold">{r.team_name}</td>
                <td className="px-4 py-3">{COMPETITIONS[r.competition]?.name ?? r.competition}</td>
                <td className="px-4 py-3">{r.team_size}</td>
                <td className="px-4 py-3 text-white/70">
                  <a href={`mailto:${r.leader_email}`} className="hover:text-brand-lime">
                    {r.leader_email}
                  </a>
                </td>
                <td className="px-4 py-3 text-white/70">{r.leader_phone}</td>
                <td className="px-4 py-3">
                  <LinkCell href={r.payment_proof_url} />
                </td>
                <td className="px-4 py-3">
                  <LinkCell href={r.submission_url} />
                </td>
                <td className="px-4 py-3 text-white/70">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <DeleteTeamButton id={r.id} teamName={r.team_name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          {total} team{total === 1 ? "" : "s"} · page {page} of {pageCount}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={filterQS({ page: page - 1 })} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Previous
            </Link>
          )}
          {page < pageCount && (
            <Link href={filterQS({ page: page + 1 })} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
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

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "verified"
      ? "bg-emerald-500/20 text-emerald-300"
      : status === "rejected"
        ? "bg-red-500/20 text-red-300"
        : "bg-yellow-500/20 text-yellow-200";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${color}`}>
      {status}
    </span>
  );
}
