import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Reached only via /auth/confirm, which has already run verifyOtp — so anyone
// seeing this page is signed in. It's a confirmation beat, not a gate.
const REDIRECT_SECONDS = 3;

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* ponytail: a meta refresh instead of a client component with a timer —
          no JS, no hydration, and it still works if JS is disabled. The button
          below is there for anyone who doesn't want to wait. */}
      <meta httpEquiv="refresh" content={`${REDIRECT_SECONDS};url=/protected`} />

      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Email confirmed</CardTitle>
            <CardDescription>You&apos;re signed in — no need to log in again.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Thanks for confirming your email. Taking you to your dashboard…
            </p>
            <Button asChild className="w-full">
              <Link href="/protected">Go to dashboard now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
