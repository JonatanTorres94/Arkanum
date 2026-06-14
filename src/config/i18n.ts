// Active locale for v0.9.0. Next.js i18n routing is NOT enabled in this release.
// Future locales are defined here as the planned expansion target.
// See docs/internationalization.md for the migration strategy.

export const i18nConfig = {
  defaultLocale: "es" as const,
  futureLocales:  ["pt-BR", "en"] as const,
};

export type DefaultLocale  = typeof i18nConfig.defaultLocale;
export type FutureLocale   = (typeof i18nConfig.futureLocales)[number];
