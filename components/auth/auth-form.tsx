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
        <div className="mt-7 border-t border-brand-cream/10 pt-5 text-center text-sm leading-[44px] text-brand-cream/55 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Every auth field is the same input at the same size, on the dark shell. */
export const authFieldClass = "h-12";

/** How long to keep the button pending before assuming the redirect died. */
const REDIRECT_TIMEOUT_MS = 10_000;

/**
 * Leave the app for `href` after a successful auth change, and hold the form's
 * pending state until the page actually goes away.
 *
 * A hard navigation (rather than router.push) because every destination is a
 * server component calling getUser(), and Next's Router Cache would otherwise
 * serve the RSC payload it prefetched while logged out — that was the "logged
 * in but still on the login page until I refresh" bug.
 *
 * `location.replace` doesn't block, so returning normally here would let
 * AuthForm's `finally { setIsLoading(false) }` fire immediately and flip the
 * button back to a clickable "Login" for the whole unload window — a
 * double-submit on a slow phone. So we await instead.
 *
 * But awaiting forever means a navigation that never happens leaves the user
 * staring at a spinner with no way out. So it's a timeout, not an infinite
 * hang: if we're still alive after 10s the redirect clearly failed, and the
 * returned node replaces the form with a manual link. The user IS authenticated
 * at this point — the sign-in already succeeded — so the only thing lost is the
 * automatic hop.
 */
export async function redirectAfterAuth(href: string): Promise<ReactNode> {
  window.location.replace(href);
  await new Promise((resolve) => setTimeout(resolve, REDIRECT_TIMEOUT_MS));
  return (
    <div className="flex flex-col gap-3 text-center">
      <p className="text-sm leading-relaxed text-brand-cream/70">
        You&rsquo;re signed in, but we couldn&rsquo;t send you on automatically.
      </p>
      {/* Plain <a>, not next/link: the whole point is a fresh document request,
          so the server re-reads the new auth cookie. */}
      <a href={href} className="btn-brand px-8 py-3 text-sm">
        Continue
      </a>
    </div>
  );
}
