import { SiteChrome } from "@/components/site-chrome";

export default function BrandingLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
