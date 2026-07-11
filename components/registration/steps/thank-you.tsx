"use client";

import Link from "next/link";
import Image from "next/image";

export function ThankYou() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 w-full py-8">
      <div className="relative">

        <h1 className="text-9xl font-bold text-gradient-brand relative z-10 drop-shadow-md">
          Thank You
        </h1>
      </div>

      {/* <Image
        src="/nestlogo.webp"
        alt="Nest UI 2026 logo"
        width={800}
        height={800}
        priority
        className="h-auto w-44 shrink-0 drop-shadow-2xl sm:w-56 md:w-72"
      /> */}
      {/* gatau taroh atau ngga? */}
      <h1 className="text-2xl font-bold text-gradient-brand relative z-10 drop-shadow-md">
        You can join the WhatsApp Group using the QR Code below. See you there!!
      </h1>
      <div className="w-64 h-64 bg-white/80 rounded-xl flex flex-col items-center justify-center text-center p-6 shadow-inner relative z-10">
        <p className="font-bold text-brand-green text-sm">
          maybe taro QR group nnt klo mau
        </p>
      </div>

      <Link
        href="/branding/homepage"
        className="px-10 py-3 rounded-full bg-gradient-to-b from-brand-lime-soft to-brand-lime text-brand-green font-bold text-lg shadow-lg hover:brightness-105 transition-all relative z-10"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
