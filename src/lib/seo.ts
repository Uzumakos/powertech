import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Canonical URL plus the same page in every language (hreflang), so search
 * engines show French and English visitors the right version.
 * `path` is the part after the locale: "" for home, "/produits", …
 */
export function localeAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, `/${code}${path}`])),
      "x-default": `/fr${path}`,
    },
  };
}

/** Renders a JSON-LD block (structured data read by search engines). */
export function jsonLd(data: Record<string, unknown>) {
  // "<" is escaped so content can never close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
