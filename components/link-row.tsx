// Labelled external link with a "—" fallback for empty values. Shared by the
// participant dashboard and the admin registration detail page.
export function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <p className="text-white/80">
      <span className="text-white/45">{label}:</span>{" "}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-brand-lime hover:underline"
        >
          {href}
        </a>
      ) : (
        <span className="text-white/40">—</span>
      )}
    </p>
  );
}
