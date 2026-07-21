import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthPageShell
      heading="Log in to NEST UI"
      subheading="Manage your team and submissions."
    >
      <LoginForm />
    </AuthPageShell>
  );
}
