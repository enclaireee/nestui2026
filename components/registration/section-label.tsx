import type { ComponentType, ReactNode } from "react";

// Shared section heading for the registration steps: a small icon tile + label,
// on the light glass card. Keeps every step's headings visually consistent.
export function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10">
        <Icon className="h-4 w-4 text-brand-green" />
      </span>
      <span className="text-lg font-bold text-brand-green">{children}</span>
    </div>
  );
}
