"use client";

import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthForm, authFieldClass } from "@/components/auth/auth-form";
import { RegistrationInput } from "@/components/registration/registration-input";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  async function sendResetLink() {
    const supabase = createClient();
    // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
    // Returning a node swaps it in for the form — see AuthForm.
    return (
      <>
        <h2 className="mb-2 text-2xl font-bold text-brand-green md:text-3xl">
          Check Your Email
        </h2>
        <p className="text-sm text-brand-green/80 md:text-base">
          If you registered using your email and password, you will receive a
          password reset email.
        </p>
      </>
    );
  }

  return (
    <AuthForm
      submitLabel="Send Verification Link"
      pendingLabel="Sending..."
      onSubmit={sendResetLink}
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
        className={authFieldClass}
      />
      <p className="-mt-2 text-xs font-semibold text-brand-green/80 md:text-sm">
        Enter your email to send the verification link
      </p>
    </AuthForm>
  );
}
