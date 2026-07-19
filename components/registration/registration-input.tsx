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
}

export const RegistrationInput = React.forwardRef<
  HTMLInputElement,
  RegistrationInputProps
>(({ className, icon: Icon, label, hint, error, id, ...props }, ref) => {
  // useId so label/hint/error wiring works without callers inventing ids.
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="pl-1 text-xs font-bold uppercase tracking-wide text-brand-green/70"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "flex h-12 w-full rounded-xl border-none bg-white/90 px-4 py-2 text-sm text-brand-green placeholder:text-gray-400 shadow-sm ring-1 ring-brand-green/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:cursor-not-allowed disabled:opacity-50 [&:user-invalid]:ring-2 [&:user-invalid]:ring-red-400 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400",
            Icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="pl-1 text-xs text-brand-green/60">
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
