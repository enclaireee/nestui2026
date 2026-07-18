import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

// Keep crawlers out of auth'd/private areas; index the public marketing pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/protected", "/auth"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
