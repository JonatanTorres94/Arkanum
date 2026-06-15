import type { MetadataRoute } from "next";
import { publicRoutes } from "@/config/routes";
import { getCanonicalUrl } from "@/lib/seo/canonical";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url:             getCanonicalUrl(route.path),
    lastModified:    new Date(),
    changeFrequency: route.changeFrequency,
    priority:        route.priority,
  }));
}
