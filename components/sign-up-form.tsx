"use client";

import { Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/registration/glass-card";
import { RegistrationInput } from "@/components/registration/registration-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm?next=/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <GlassCard className="lg:p-12">
        <h2 className="mb-6 text-2xl font-bold text-brand-green md:mb-8 md:text-3xl">Welcome!</h2>
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-4 md:gap-5">
            <RegistrationInput
              icon={Mail}
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="md:h-14 md:text-base"
            />
            <RegistrationInput
              icon={Lock}
              type="password"
              placeholder="Password"
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
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="md:h-14 md:text-base"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100 md:py-3.5 md:text-base"
            >
              {isLoading ? "Creating an account..." : "Sign Up"}
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-brand-green md:mt-6 md:text-base">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
