import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function Page() {
  return (
    <AuthPageShell
      heading="Forgot your password?"
      subheading="We'll email you a link to set a new one."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
