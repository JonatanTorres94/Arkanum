// i18n routing is NOT active. Only "es" is served.
// See docs/internationalization.md for the activation plan and migration path.

export const locales = ["es", "pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export const activeLocales = ["es"] as const;
export type ActiveLocale = (typeof activeLocales)[number];

export const futureLocales = ["pt-BR", "en"] as const;
export type FutureLocale = (typeof futureLocales)[number];

export const defaultLocale = "es" satisfies ActiveLocale;

export const localeConfig: Record<
  Locale,
  { label: string; territory: string | null; direction: "ltr" | "rtl"; active: boolean }
> = {
  es:      { label: "Español",   territory: "AR", direction: "ltr", active: true  },
  "pt-BR": { label: "Português", territory: "BR", direction: "ltr", active: false },
  en:      { label: "English",   territory: null,  direction: "ltr", active: false },
};

export function isActiveLocale(locale: string): locale is ActiveLocale {
  return (activeLocales as readonly string[]).includes(locale);
}

export function isFutureLocale(locale: string): locale is FutureLocale {
  return (futureLocales as readonly string[]).includes(locale);
}
