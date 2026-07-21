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
        tone="dark"
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
        tone="dark"
        className={authFieldClass}
      />
      {/* Right-aligned under the password field, the way every reference does
          it. Was `text-brand-green/80` — dark green on the new dark green
          shell, i.e. completely invisible. */}
      <Link
        href="/auth/forgot-password"
        className="-mt-1 self-end text-xs font-medium text-brand-cream/55 underline-offset-4 transition-colors hover:text-brand-lime hover:underline"
      >
        Forgot password?
      </Link>
    </AuthForm>
  );
}
