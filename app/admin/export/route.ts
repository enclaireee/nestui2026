import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthed } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMPETITIONS, isCompetitionId } from "@/lib/registrations/config";
import { csvSafe } from "@/lib/sanitize";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import type { AdminRegistration } from "@/lib/admin/types";

// One row per team; leader + members flattened into columns. Blocked without an
// admin session. Values pass through csvSafe() (quoted + formula-injection guard).
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
  let query = supabase
    .from("admin_registrations_detail")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (competition) query = query.eq("competition", competition);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const rows = (data as AdminRegistration[] | null) ?? [];

  // Column count = leader + the largest team's member count across the export.
  const maxMembers = rows.reduce((max, r) => Math.max(max, r.members.length), 0);

  const header = [
    "Code",
    "Team",
    "Competition",
    "Status",
    "SubmittedAt",
    "PaymentProofUrl",
    "SubmissionUrl",
    "Leader_Name",
    "Leader_Email",
    "Leader_Phone",
    "Leader_StudentId",
    "Leader_Institution",
    "Leader_Major",
    "Leader_ConfirmationUrl",
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

  const lines = [header.map(csvSafe).join(",")];
  for (const r of rows) {
    const cells: unknown[] = [
      r.code,
      r.team_name,
      COMPETITIONS[r.competition]?.name ?? r.competition,
      r.status,
      r.submitted_at,
      r.payment_proof_url,
      r.submission_url,
      r.leader_name,
      r.leader_email,
      r.leader_phone,
      r.leader_student_id,
      r.leader_institution,
      r.leader_major ?? "",
      r.leader_confirmation_url,
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
