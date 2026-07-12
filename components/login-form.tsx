"use client";

import { Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/registration/glass-card";
import { RegistrationInput } from "@/components/registration/registration-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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
      <GlassCard>
        <h2 className="mb-6 text-2xl font-bold text-brand-green">Welcome Back!</h2>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-4">
            <RegistrationInput
              icon={Mail}
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <RegistrationInput
              icon={Lock}
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              href="/auth/forgot-password"
              className="-mt-2 text-xs font-semibold text-brand-green/80 underline-offset-4 hover:underline"
            >
              Forgot Password?
            </Link>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-brand-lime to-brand-cream px-4 py-2.5 text-sm font-bold tracking-wide text-brand-teal shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-brand-green">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="font-bold underline underline-offset-4">
              Sign Up
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
