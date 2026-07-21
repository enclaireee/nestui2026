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
      // Confirmation state. Recoloured for the dark shell — this was
      // brand-green text, which on the new background was invisible.
      <div className="rounded-xl bg-brand-lime/[0.08] px-5 py-6 text-center ring-1 ring-brand-lime/25">
        <p className="text-base font-bold text-brand-cream">Check your email</p>
        <p className="mt-2 text-sm leading-relaxed text-brand-cream/60">
          If you registered using your email and password, you will receive a
          password reset email.
        </p>
      </div>
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
        tone="dark"
        className={authFieldClass}
      />
      <p className="-mt-1 text-xs text-brand-cream/45">
        Enter your email to send the verification link.
      </p>
    </AuthForm>
  );
}
