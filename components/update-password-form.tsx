"use client";

import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthForm, authFieldClass, redirectAfterAuth } from "@/components/auth/auth-form";
import { RegistrationInput } from "@/components/registration/registration-input";
import { useState } from "react";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function updatePassword() {
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    if (password !== confirmPassword) throw new Error("Passwords do not match");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    // Hard navigation — see the note in login-form.tsx.
    return redirectAfterAuth("/protected");
  }

  return (
    <AuthForm
      submitLabel="Change Password"
      pendingLabel="Saving..."
      onSubmit={updatePassword}
    >
      <RegistrationInput
        icon={Lock}
        type="password"
        label="New password"
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
        label="Confirm new password"
        placeholder="Repeat your new password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        tone="dark"
        className={authFieldClass}
      />
    </AuthForm>
  );
}
