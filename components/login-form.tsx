"use client";

import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthForm, authFieldClass } from "@/components/auth/auth-form";
import { RegistrationInput } from "@/components/registration/registration-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/sanitize";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function login() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // ?next= is set by the proxy when it bounced an unauthenticated visitor
    // off a protected page — send them back there, not to the dashboard.
    router.push(safeNextPath(new URLSearchParams(window.location.search).get("next")));
  }

  return (
    <AuthForm
      heading="Welcome Back!"
      submitLabel="Login"
      pendingLabel="Logging in..."
      onSubmit={login}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="font-bold underline underline-offset-4">
            Sign Up
          </Link>
        </>
      }
    >
      <RegistrationInput
        icon={Mail}
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={authFieldClass}
      />
      <RegistrationInput
        icon={Lock}
        type="password"
        label="Password"
        placeholder="Your password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={authFieldClass}
      />
      <Link
        href="/auth/forgot-password"
        className="-mt-2 text-xs font-semibold text-brand-green/80 underline-offset-4 hover:underline md:text-sm"
      >
        Forgot Password?
      </Link>
    </AuthForm>
  );
}
