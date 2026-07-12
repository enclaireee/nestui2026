import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { adminLogout } from "@/app/admin/actions";
import { AdminBackground } from "@/components/admin/admin-background";
import Link from "next/link";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Static shell renders instantly; the auth check (cookie read) + the page's
  // data fetches stream in inside the Suspense boundary, satisfying Next 16's
  // cacheComponents "no blocking data outside <Suspense>" rule.
  return (
    <div className="relative min-h-screen text-white">
      <AdminBackground />
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link href="/admin" className="text-lg font-bold text-gradient-brand">
          NEST UI 2026 · Admin
        </Link>
        <form action={adminLogout}>
          <button
            type="submit"
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-red-300"
          >
            Log out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Suspense fallback={<AdminLoading />}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
    </div>
  );
}

// Runs the cookie-based auth check (and gates the page) inside the boundary.
async function AdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // redirects to /admin/login when unauthenticated
  return <>{children}</>;
}

function AdminLoading() {
  return <div className="py-16 text-center text-sm text-white/50">Loading…</div>;
}
