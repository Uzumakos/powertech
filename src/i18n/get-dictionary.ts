import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { getSettings, getTextOverrides } from "@/lib/data";
import { hasLocale, type Locale } from "./config";
import { formatDeep, mergeDeep } from "./merge";
import type { Dictionary } from "./dictionaries/fr";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

/** Current locale from the `[lang]` root segment (Server Components only). */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

/** Built-in text with the admin's edits applied, placeholders untouched. */
export async function getRawDictionary(locale: Locale): Promise<Dictionary> {
  const [base, overrides] = await Promise.all([dictionaries[locale](), getTextOverrides(locale)]);
  return mergeDeep(base, overrides);
}

/** The dictionary for an explicit locale (for Server Actions, which can't read root params). */
export async function getDictionaryFor(locale: Locale): Promise<Dictionary> {
  "use cache";
  cacheTag("texts", "settings");
  cacheLife("hours");

  const [dict, settings] = await Promise.all([getRawDictionary(locale), getSettings()]);
  // Site-wide placeholders are resolved once here; per-use ones ({phone},
  // {count}, {name}…) are left for the components that know their values.
  return formatDeep(dict, {
    company: settings.companyName,
    founded: settings.foundedYear,
    years: settings.yearsActive,
  });
}

export async function getDictionary(): Promise<Dictionary> {
  return getDictionaryFor(await getLocale());
}
