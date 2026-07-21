import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface RegistrationInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  /**
   * Visible field name. A placeholder is not a label — it disappears the moment
   * someone types, which in a 7-field form repeated per team member means users
   * lose track of what they are filling in, and screen readers get an unnamed
   * input. Pass this on every real field.
   */
  label?: string;
  /** Short clarification under the field (format, where to find the value). */
  hint?: string;
  error?: string;
  /**
   * Surface this field sits on. "light" (default) is the registration wizard's
   * glass-on-bright-green. "dark" is the auth pages, which sit on solid
   * brand-green — there the default label colour (brand-green/70) would be
   * dark green on dark green and effectively invisible.
   *
   * Additive with a default, so every existing call site is untouched.
   */
  tone?: "light" | "dark";
}

const TONE = {
  light: {
    label: "text-brand-green/70",
    hint: "text-brand-green/60",
    icon: "text-gray-400",
    input:
      "border-none bg-white/90 text-brand-green placeholder:text-gray-400 shadow-sm ring-1 ring-brand-green/10 focus-visible:ring-2 focus-visible:ring-brand-lime",
  },
  dark: {
    label: "text-brand-cream/55",
    hint: "text-brand-cream/45",
    icon: "text-brand-cream/35",
    input:
      "border-none bg-brand-cream/[0.06] text-brand-cream placeholder:text-brand-cream/30 ring-1 ring-brand-cream/15 hover:ring-brand-cream/25 focus-visible:ring-2 focus-visible:ring-brand-lime",
  },
} as const;

export const RegistrationInput = React.forwardRef<
  HTMLInputElement,
  RegistrationInputProps
>(({ className, icon: Icon, label, hint, error, id, tone = "light", ...props }, ref) => {
  // useId so label/hint/error wiring works without callers inventing ids.
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const t = TONE[tone];

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className={cn("pl-1 text-xs font-bold uppercase tracking-wide", t.label)}
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className={cn("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2", t.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "flex h-12 w-full rounded-xl px-4 py-2 text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&:user-invalid]:ring-2 [&:user-invalid]:ring-red-400 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400",
            t.input,
            Icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className={cn("pl-1 text-xs", t.hint)}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="pl-1 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});
RegistrationInput.displayName = "RegistrationInput";
