"use client";

import Image from "next/image";
import Link from "next/link";
import { COMPETITIONS, type CompetitionId } from "@/lib/registrations/config";

export function ThankYou({ code, competition }: { code?: string; competition?: CompetitionId | null }) {
  const cfg = competition ? COMPETITIONS[competition] : null;

  return (
    <div className="flex flex-col items-center justify-center gap-10 w-full py-8">
      <h1 className="text-2xl font-bold text-gradient-brand relative z-10 drop-shadow-md text-center">
        Your team has been registered!
      </h1>

      {code && (
        <div className="rounded-2xl bg-white/85 px-8 py-4 text-center shadow-inner">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-green/70">
            Registration Code
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{code}</p>
        </div>
      )}

      <p className="text-lg font-bold text-gradient-brand relative z-10 drop-shadow-md text-center max-w-md">
        Join the {cfg?.name ?? ""} WhatsApp Group using the QR Code below. See you there!
      </p>

      <div className="flex flex-col items-center gap-3">
        <div className="relative h-56 w-56 overflow-hidden rounded-xl bg-white p-3 shadow-inner">
          {cfg ? (
            <Image
              src={cfg.qr}
              alt={`${cfg.name} WhatsApp group QR code`}
              fill
              sizes="224px"
              className="object-contain p-3"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center">
              <p className="text-sm font-bold text-brand-green">WhatsApp group QR</p>
            </div>
          )}
        </div>
        {cfg && (
          <p className="text-xs font-semibold text-brand-green/70">{cfg.name} participants</p>
        )}
      </div>

      <Link
        href="/protected"
        className="btn-brand relative z-10 px-10 py-3 text-lg"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
