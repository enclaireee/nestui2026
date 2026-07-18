"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/registration/glass-card";
import { RegistrationInput } from "@/components/registration/registration-input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <GlassCard className="lg:p-12">
        <h2 className="mb-6 text-2xl font-bold text-brand-green md:mb-8 md:text-3xl">Reset Password</h2>
        <form onSubmit={handleForgotPassword}>
          <div className="flex flex-col gap-4 md:gap-5">
            <RegistrationInput
              icon={Lock}
              type="password"
              placeholder="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="md:h-14 md:text-base"
            />
            <RegistrationInput
              icon={Lock}
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="md:h-14 md:text-base"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100 md:py-3.5 md:text-base"
            >
              {isLoading ? "Saving..." : "Change Password"}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
