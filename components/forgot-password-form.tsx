"use client";

import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/registration/glass-card";
import { RegistrationInput } from "@/components/registration/registration-input";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <GlassCard>
        {success ? (
          <>
            <h2 className="mb-2 text-2xl font-bold text-brand-green">Check Your Email</h2>
            <p className="text-sm text-brand-green/80">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-4">
              <RegistrationInput
                icon={Mail}
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="-mt-2 text-xs font-semibold text-brand-green/80">
                Enter your email to send the verification link
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100"
              >
                {isLoading ? "Sending..." : "Send Verification Link"}
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-brand-green">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
