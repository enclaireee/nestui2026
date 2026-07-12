"use client";

import Link from "next/link";

export function ThankYou({ code }: { code?: string }) {
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
        Join the WhatsApp Group using the QR Code below. See you there!
      </p>

      <div className="w-56 h-56 bg-white/80 rounded-xl flex items-center justify-center text-center p-6 shadow-inner">
        <p className="font-bold text-brand-green text-sm">WhatsApp group QR</p>
      </div>

      <Link
        href="/protected"
        className="px-10 py-3 rounded-full bg-gradient-to-b from-brand-lime-soft to-brand-lime text-brand-green font-bold text-lg shadow-lg hover:brightness-105 transition-all relative z-10"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
