import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <AuthPageShell
      heading="Create your account"
      subheading="One account covers every NEST UI 2026 competition."
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
