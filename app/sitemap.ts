import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

// Public, indexable routes only. Auth'd areas (/admin, /protected, /auth) are
// excluded here and in robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    { path: "/", priority: 1 },
    { path: "/branding/aboutpage", priority: 0.8 },
  ];
  return paths.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
