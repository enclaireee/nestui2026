import type { ComponentType, ReactNode } from "react";

// Shared section heading for the registration steps. Recoloured for the dark
// wizard card — it was `text-brand-green` on a light glass panel, which on the
// new surface rendered dark green on dark green and vanished entirely.
// The underline is what makes a step with three sections read as three
// sections rather than one long scroll.
export function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-brand-cream/10 pb-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-lime/15">
        <Icon className="h-4 w-4 text-brand-lime" />
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.1em] text-brand-cream/90">
        {children}
      </span>
    </div>
  );
}
