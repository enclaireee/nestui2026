import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Who the confirmation email actually comes from. Supabase's built-in SMTP
// sends as this address; if custom SMTP is ever configured in the Supabase
// dashboard (Project Settings → Authentication → SMTP), change this one line to
// match — the copy below reads from it so the two can't drift apart.
const SENDER = "noreply@mail.app.supabase.io";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link — click it to activate your
              account.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">
                Can&apos;t find the email?
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                It is sent by <span className="font-medium text-foreground">Supabase</span>,
                the service that handles our logins — so in Gmail it will
                <span className="font-medium text-foreground"> not </span>
                appear as being from NEST UI. Search your inbox for:
              </p>
              <p className="mt-2 select-all break-all rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground">
                {SENDER}
              </p>
              <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Check <span className="font-medium text-foreground">Spam</span> and
                  the <span className="font-medium text-foreground">Promotions</span>{" "}
                  tab — it often lands there.
                </li>
                <li>Delivery can take a couple of minutes.</li>
                <li>
                  If it did go to spam, mark it{" "}
                  <span className="font-medium text-foreground">Not spam</span> so
                  later emails reach you.
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Open the link in{" "}
              <span className="font-medium text-foreground">this same browser</span>{" "}
              and you&apos;ll be signed in straight away — no need to log in
              again.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
