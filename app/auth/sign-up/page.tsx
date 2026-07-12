import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <AuthPageShell heading="Sign Up" showLogo>
      <SignUpForm />
    </AuthPageShell>
  );
}
