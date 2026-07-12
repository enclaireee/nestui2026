"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "./actions";
import { AdminBackground } from "@/components/admin/admin-background";

const initial: AdminLoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initial);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-6">
      <AdminBackground />
      <form
        action={formAction}
        className="w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/5 p-8 shadow-2xl ring-1 ring-white/5"
      >
        <h1 className="mb-1 text-2xl font-bold text-gradient-brand">Admin Login</h1>
        <p className="mb-6 text-xs font-medium text-white/60">
          NEST UI 2026 — registration administration
        </p>

        <div className="flex flex-col gap-4">
          <input
            name="username"
            autoComplete="username"
            placeholder="Username"
            required
            className="h-12 w-full rounded-xl border-none bg-white/90 px-4 text-sm text-brand-green placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            className="h-12 w-full rounded-xl border-none bg-white/90 px-4 text-sm text-brand-green placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
          />

          {state.error && <p className="text-sm font-semibold text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </main>
  );
}
