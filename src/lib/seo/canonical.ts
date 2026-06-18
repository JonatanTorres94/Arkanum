import { siteConfig } from "@/config/site";
import { activeLocales, defaultLocale, type ActiveLocale } from "@/config/i18n";

export function getCanonicalUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

// Returns the URL for a specific locale variant of a path.
// When locale is the default, no prefix is added (clean URLs for es).
export function getLocalizedUrl(path: string, locale: ActiveLocale): string {
  if (locale === defaultLocale) return getCanonicalUrl(path);
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${locale}${normalized}`;
}

// Returns hreflang alternates for a path, keyed by locale.
// Returns empty object when only one locale is active — no hreflang emitted
// for single-language sites (avoids pointing to non-existent pages).
// NOTE: assumes pt-BR path = /pt-BR{path} (same slug). For pages with
// translated slugs use getBilingualAlternates instead.
export function getAlternates(path: string): Partial<Record<ActiveLocale | "x-default", string>> {
  if (activeLocales.length <= 1) return {};
  return {
    ...Object.fromEntries(activeLocales.map((l) => [l, getLocalizedUrl(path, l)])),
    "x-default": getCanonicalUrl(path),
  } as Record<ActiveLocale | "x-default", string>;
}

// Explicit bilingual alternates for pages where the pt-BR slug differs from the ES slug.
// Use this instead of getAlternates whenever the two paths are not mirror images.
export function getBilingualAlternates(
  esPath: string,
  ptBrPath: string
): Record<"es" | "pt-BR" | "x-default", string> {
  return {
    "es":        getCanonicalUrl(esPath),
    "pt-BR":     getCanonicalUrl(ptBrPath),
    "x-default": getCanonicalUrl(esPath),
  };
}
