import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

// Copy lives here, keyed by a code from /auth/confirm — the page never renders
// text that arrived on the query string, so nobody can put their own wording
// (a fake support number, say) on a nestui2026 URL.
const MESSAGES: Record<string, { title: string; body: string }> = {
  missing_token: {
    title: "This link looks incomplete",
    body: "The confirmation link is missing part of its address — some email apps break long links across lines. Try copying the whole link into your browser.",
  },
  wrong_browser: {
    title: "Open the link in the same browser",
    body: "For security, a confirmation link has to be opened in the same browser you signed up from. Open it there, or just log in with the email and password you registered.",
  },
  expired: {
    title: "This link has expired",
    body: "Confirmation links can only be used once and time out after a while. Try logging in — if your email was already confirmed, it will just work.",
  },
};

const FALLBACK = {
  title: "Sorry, something went wrong.",
  body: "We couldn't complete that request. Please try again, or log in if you already confirmed your email.",
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const { title, body } = (code && MESSAGES[code]) || FALLBACK;

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{body}</p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Go to login</Link>
        </Button>
      </CardContent>
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <Suspense
            fallback={
              <CardHeader>
                <CardTitle className="text-2xl">{FALLBACK.title}</CardTitle>
              </CardHeader>
            }
          >
            <ErrorContent searchParams={searchParams} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
