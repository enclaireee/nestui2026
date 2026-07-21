import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPETITIONS, isCompetitionId } from "@/lib/registrations/config";
import { csvSafe } from "@/lib/sanitize";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import type { AdminRegistration, AdminSubmissionDetail } from "@/lib/admin/types";

// One row per team (leader + members flattened into columns), followed by every
// submission that team made flattened into per-entry columns (Entry 1 inline +
// each resubmission). Blocked without an admin session. Values pass through
// csvSafe() (quoted + formula-injection guard).
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Full-table join per hit — cap it so even a valid admin session can't hammer
  // it into a connection-pool DoS (20 exports / 10 min / IP).
  if (!(await checkRateLimit(`export:${clientIp(request.headers)}`, 20, 600))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const competitionParam = request.nextUrl.searchParams.get("competition");
  const competition = isCompetitionId(competitionParam) ? competitionParam : null;

  const supabase = createAdminClient();

  let teamQuery = supabase
    .from("admin_registrations_detail")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (competition) teamQuery = teamQuery.eq("competition", competition);
  const { data: teamData, error } = await teamQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const teams = (teamData as AdminRegistration[] | null) ?? [];

  // All submissions across those teams, keyed by registration. If the
  // submissions view isn't present yet, fall back to the inline Entry 1 so the
  // export still produces the same data it always did.
  const byReg = new Map<string, AdminSubmissionDetail[]>();
  let subQuery = supabase
    .from("admin_submissions_detail")
    .select("*")
    .order("entry_no", { ascending: true });
  if (competition) subQuery = subQuery.eq("competition", competition);
  const { data: subData } = await subQuery;
  for (const s of (subData as AdminSubmissionDetail[] | null) ?? []) {
    const list = byReg.get(s.registration_id) ?? [];
    list.push(s);
    byReg.set(s.registration_id, list);
  }
  const entriesFor = (r: AdminRegistration): AdminSubmissionDetail[] =>
    byReg.get(r.id) ?? [
      {
        submission_id: r.id,
        registration_id: r.id,
        code: r.code,
        team_name: r.team_name,
        competition: r.competition,
        leader_email: r.leader_email,
        is_primary: true,
        entry_no: 1,
        payment_proof_url: r.payment_proof_url,
        submission_url: r.submission_url,
        status: r.status,
        submitted_at: r.submitted_at,
      },
    ];

  // Column widths = the widest team's member count and the most submissions any
  // one team made, across the whole export.
  const maxMembers = teams.reduce((max, r) => Math.max(max, r.members.length), 0);
  const maxEntries = teams.reduce((max, r) => Math.max(max, entriesFor(r).length), 1);

  const header = [
    "Code",
    "Team",
    "Competition",
    "TeamSize",
    "RegisteredAt",
    "Leader_Name",
    "Leader_Email",
    "Leader_Phone",
    "Leader_StudentId",
    "Leader_Institution",
    "Leader_Major",
    "Leader_ConfirmationUrl",
    "OriginalityLetterUrl",
  ];
  for (let i = 1; i <= maxMembers; i++) {
    header.push(
      `Member${i}_Name`,
      `Member${i}_Email`,
      `Member${i}_Phone`,
      `Member${i}_StudentId`,
      `Member${i}_Institution`,
      `Member${i}_Major`,
      `Member${i}_ConfirmationUrl`,
    );
  }
  for (let i = 1; i <= maxEntries; i++) {
    header.push(
      `Entry${i}_Status`,
      `Entry${i}_SubmittedAt`,
      `Entry${i}_PaymentProofUrl`,
      `Entry${i}_SubmissionUrl`,
    );
  }

  const lines = [header.map(csvSafe).join(",")];
  for (const r of teams) {
    const cells: unknown[] = [
      r.code,
      r.team_name,
      COMPETITIONS[r.competition]?.name ?? r.competition,
      r.team_size,
      r.submitted_at,
      r.leader_name,
      r.leader_email,
      r.leader_phone,
      r.leader_student_id,
      r.leader_institution,
      r.leader_major ?? "",
      r.leader_confirmation_url,
      r.originality_letter_url ?? "",
    ];
    for (let i = 0; i < maxMembers; i++) {
      const m = r.members[i];
      cells.push(
        m?.name ?? "",
        m?.email ?? "",
        m?.phone ?? "",
        m?.student_id ?? "",
        m?.institution ?? "",
        m?.major ?? "",
        m?.confirmation_url ?? "",
      );
    }
    const entries = entriesFor(r);
    for (let i = 0; i < maxEntries; i++) {
      const e = entries[i];
      cells.push(
        e?.status ?? "",
        e?.submitted_at ?? "",
        e?.payment_proof_url ?? "",
        e?.submission_url ?? "",
      );
    }
    lines.push(cells.map(csvSafe).join(","));
  }

  const csv = "﻿" + lines.join("\r\n"); // BOM so Excel reads UTF-8
  const filename = `nestui2026-registrations-${competition ?? "all"}-${
    new Date().toISOString().slice(0, 10)
  }.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
