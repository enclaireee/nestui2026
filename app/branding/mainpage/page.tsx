import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MainPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <SiteHeader />

        <div className="flex-1 w-full max-w-5xl flex flex-col p-5">
          <section className="flex flex-col gap-4 py-20">
            <h1 className="text-4xl font-bold tracking-tight">Welcome 👋</h1>
            <p className="max-w-prose text-lg text-muted-foreground">
              This is a clean starting point. Edit{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                app/branding/mainpage/page.tsx
              </code>{" "}
              to start building.
            </p>
          </section>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
