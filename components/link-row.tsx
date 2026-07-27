import { ArrowUpRight } from "lucide-react";

// Labelled external link with a "—" fallback for empty values. Shared by the
// participant dashboard and the admin registration detail page.
export function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <p className="text-white/80">
      <span className="text-white/55">{label}:</span>{" "}
      {href ? (
        // The URL used to BE the link text. A Drive folder URL is 60-90 chars,
        // which `break-all` turned into four lines of character-broken noise at
        // 360px — twice per submission card, burying the status underneath.
        // Full URL still reachable via the title/aria-label.
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={href}
          aria-label={`${label} — opens in a new tab`}
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-lime hover:underline"
        >
          Open link
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <span className="text-white/55">—</span>
      )}
    </p>
  );
}
