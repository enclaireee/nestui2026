"use client";

import { useState, type ReactNode } from "react";
import { friendlyAuthError } from "@/lib/auth-errors";

interface AuthFormProps {
  /** Button copy: resting, then while the request is in flight. */
  submitLabel: string;
  pendingLabel: string;
  /** The fields. */
  children: ReactNode;
  /** Rendered under the button — the "Already have an account?" line. */
  footer?: ReactNode;
  /**
   * Throw to show an error (the message is passed through friendlyAuthError,
   * so a plain `throw new Error("Passwords do not match")` works for local
   * validation too). Return a node to replace the form with it — that's how
   * forgot-password swaps in its "check your email" confirmation.
   */
  onSubmit: () => Promise<ReactNode | void>;
}

export function AuthForm({
  submitLabel,
  pendingLabel,
  children,
  footer,
  onSubmit,
}: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<ReactNode | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await onSubmit();
      if (result) setDone(result);
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  }

  // No card. The references wrap their auth fields in nothing at all — a
  // bordered panel floating on a page that is already a single flat colour
  // just draws a box around empty contrast. The form sits directly on the
  // shell's brand-green.
  return (
    <div className="flex flex-col">
      {done ?? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {children}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300 ring-1 ring-red-500/25"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-brand mt-1 h-12 w-full text-sm"
          >
            {isLoading ? pendingLabel : submitLabel}
          </button>
        </form>
      )}

      {footer && (
        <div className="mt-7 border-t border-brand-cream/10 pt-5 text-center text-sm text-brand-cream/55">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Every auth field is the same input at the same size, on the dark shell. */
export const authFieldClass = "h-12";
