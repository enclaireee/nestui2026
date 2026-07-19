import { AuthChrome } from "@/components/site-chrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthChrome>{children}</AuthChrome>;
}
