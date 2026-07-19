import { SiteChrome } from "@/components/site-chrome";
import { MainPageContent } from "@/app/branding/mainpage/main-page-content";

// "/" is the canonical URL (see metadata in app/layout.tsx); /branding/mainpage
// serves the same content for the nav links that already point there. This
// route isn't under app/branding, so it applies the chrome itself.
export default function Home() {
  return (
    <SiteChrome>
      <MainPageContent />
    </SiteChrome>
  );
}
