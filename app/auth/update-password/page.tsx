import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <AuthPageShell
      heading="Set a new password"
      subheading="Choose something you haven't used before."
    >
      <UpdatePasswordForm />
    </AuthPageShell>
  );
}
