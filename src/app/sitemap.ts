import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             siteConfig.url,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        1,
    },
    {
      url:             `${siteConfig.url}/diagnostico`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.8,
    },
    {
      url:             `${siteConfig.url}/software-a-medida`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.9,
    },
    {
      url:             `${siteConfig.url}/automatizacion-de-procesos`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.9,
    },
  ];
}
