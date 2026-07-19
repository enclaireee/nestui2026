import { Suspense } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrationClient } from "@/components/registration/registration-client";
import { AlreadyRegistered } from "@/components/registration/already-registered";
import {
  isCompetitionId,
  type Category,
  type CompetitionId,
} from "@/lib/registrations/config";

const bgSvg = readFileSync(
  join(process.cwd(), "public/mainpagebackground.svg"),
  "utf8",
).replace("<svg", '<svg preserveAspectRatio="xMidYMid slice"');

/**
 * Shared body for /branding/registration and /branding/registration/sma —
 * the two differ only by `category`, so the auth check, background artwork and
 * already-registered handling live here once.
 */
export function RegistrationPage({ category }: { category?: Category }) {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 transform-gpu [contain:paint] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: bgSvg }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG backdrop; next/image does not optimise SVG. */}
      <img
        src="/lefttopfloaterreg.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-auto w-44 sm:w-64 md:w-80 opacity-80"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG backdrop; next/image does not optimise SVG. */}
      <img
        src="/rightfloaterreg.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 -z-10 h-auto w-96 sm:w-90 md:w-100 opacity-80"
      />

      {/* The artwork above is static and streams immediately; only the part
          that needs the session waits. Without this boundary the whole route
          is blocked on auth (and, under cacheComponents, refuses to build). */}
      <Suspense fallback={<WizardFallback />}>
        <RegistrationBody category={category} />
      </Suspense>
    </main>
  );
}

function WizardFallback() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 pb-24 pt-24">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-10 h-[28rem] w-full max-w-2xl animate-pulse rounded-[2rem] border border-white/20 bg-white/10" />
    </div>
  );
}

async function RegistrationBody({ category }: { category?: Category }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // One team per account. If this user already registered, don't offer the
  // wizard again — send them to the dashboard, where additional paid entries go
  // through "Submit again" (the resubmit flow), not a fresh registration.
  const { data: existing } = await supabase
    .from("registrations")
    .select("team_name, competition");
  const rows = (existing ?? []).filter(
    (r): r is { team_name: string; competition: CompetitionId } =>
      isCompetitionId(r.competition),
  );

  return rows.length > 0 ? (
    <AlreadyRegistered teams={rows} />
  ) : (
    <RegistrationClient category={category} />
  );
}
