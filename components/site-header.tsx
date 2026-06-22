import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/lib/utils";

export function SiteHeader() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <Link href="/" className="font-semibold">
          App
        </Link>
        {hasEnvVars ? (
          <Suspense fallback={null}>
            <AuthButton />
          </Suspense>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
