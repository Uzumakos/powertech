export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const localeCookie = "NEXT_LOCALE";

export function hasLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** A string stored in both site languages (database jsonb `{fr, en}`). */
export type Localized = { fr: string; en: string };

export function pick(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value[defaultLocale] || "";
}

/** Replaces `{name}` placeholders in a dictionary string. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}
