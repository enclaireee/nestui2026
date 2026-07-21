"use client";

import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthForm, authFieldClass } from "@/components/auth/auth-form";
import { RegistrationInput } from "@/components/registration/registration-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/sanitize";
import { useState } from "react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const router = useRouter();

  async function signUp() {
    // Real enforcement is Supabase Auth → Policies → minimum password length
    // (set it to 8 there too); this is the inline message so people aren't
    // bounced by a server error.
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    if (password !== repeatPassword) throw new Error("Passwords do not match");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Email confirmation is off in Supabase, so signUp already returns a
    // valid session — same destination as a normal login.
    // ?next= is set by the proxy when it bounced an unauthenticated visitor
    // off a protected page — send them back there, not to the dashboard.
    router.push(safeNextPath(new URLSearchParams(window.location.search).get("next")));
  }

  return (
    <AuthForm
      submitLabel="Sign Up"
      pendingLabel="Creating an account..."
      onSubmit={signUp}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold underline underline-offset-4">
            Login
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
        placeholder="At least 8 characters"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        tone="dark"
        className={authFieldClass}
      />
      <RegistrationInput
        icon={Lock}
        type="password"
        label="Confirm password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        required
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
        tone="dark"
        className={authFieldClass}
      />
    </AuthForm>
  );
}
