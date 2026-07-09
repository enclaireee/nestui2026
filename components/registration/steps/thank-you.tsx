"use client";

import Link from "next/link";

export function ThankYou() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 w-full max-w-md py-8">
      <div className="relative">
        {/* Decorative background red text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 font-bold text-6xl opacity-80 tracking-widest pointer-events-none z-0">
          OPSIONAL
        </div>
        
        <h1 className="text-5xl font-bold text-gradient-brand relative z-10 drop-shadow-md">
          Thank You
        </h1>
      </div>

      <div className="w-64 h-64 bg-white/80 rounded-xl flex flex-col items-center justify-center text-center p-6 shadow-inner relative z-10">
        <p className="font-bold text-brand-green mb-4">
          logo or something decorative
        </p>
        <p className="font-bold text-brand-green text-sm">
          maybe taro QR group nnt klo mau
        </p>
      </div>

      <Link 
        href="/dashboard"
        className="px-10 py-3 rounded-full bg-gradient-to-b from-brand-lime-soft to-brand-lime text-brand-green font-bold text-lg shadow-lg hover:brightness-105 transition-all relative z-10"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
