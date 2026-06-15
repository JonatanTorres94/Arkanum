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
export function getAlternates(path: string): Partial<Record<ActiveLocale | "x-default", string>> {
  if (activeLocales.length <= 1) return {};
  return {
    ...Object.fromEntries(activeLocales.map((l) => [l, getLocalizedUrl(path, l)])),
    "x-default": getCanonicalUrl(path),
  } as Record<ActiveLocale | "x-default", string>;
}
