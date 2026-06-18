// pt-BR routing is active as of v0.19.0 (pilot: home, software, diagnostico).
// Full [locale] App Router restructure is deferred — see docs/internationalization.md.

export const locales = ["es", "pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export const activeLocales = ["es", "pt-BR"] as const;
export type ActiveLocale = (typeof activeLocales)[number];

export const futureLocales = ["en"] as const;
export type FutureLocale = (typeof futureLocales)[number];

export const defaultLocale = "es" satisfies ActiveLocale;

export const localeConfig: Record<
  Locale,
  { label: string; territory: string | null; direction: "ltr" | "rtl"; active: boolean }
> = {
  es:      { label: "Español",   territory: "AR", direction: "ltr", active: true  },
  "pt-BR": { label: "Português", territory: "BR", direction: "ltr", active: true  },
  en:      { label: "English",   territory: null,  direction: "ltr", active: false },
};

export function isActiveLocale(locale: string): locale is ActiveLocale {
  return (activeLocales as readonly string[]).includes(locale);
}

export function isFutureLocale(locale: string): locale is FutureLocale {
  return (futureLocales as readonly string[]).includes(locale);
}
