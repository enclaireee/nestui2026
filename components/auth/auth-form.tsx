"use client";

import { useState, type ReactNode } from "react";
import { GlassCard } from "@/components/registration/glass-card";
import { friendlyAuthError } from "@/lib/auth-errors";

interface AuthFormProps {
  /** Omitted on forgot-password, where the page shell's h1 is the only title. */
  heading?: string;
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
  heading,
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

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="lg:p-12">
        {done ?? (
          <form onSubmit={handleSubmit}>
            {heading && (
              <h2 className="mb-6 text-2xl font-bold text-brand-green md:mb-8 md:text-3xl">
                {heading}
              </h2>
            )}
            <div className="flex flex-col gap-4 md:gap-5">
              {children}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={isLoading} className="btn-brand mt-2 w-full px-4 py-2.5 text-sm md:py-3.5 md:text-base">
                {isLoading ? pendingLabel : submitLabel}
              </button>
            </div>
            {footer && (
              <div className="mt-4 text-center text-sm text-brand-green md:mt-6 md:text-base">
                {footer}
              </div>
            )}
          </form>
        )}
      </GlassCard>
    </div>
  );
}

/** Every auth field is the same input at the same size. */
export const authFieldClass = "md:h-14 md:text-base";
