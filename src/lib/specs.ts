import { pick, type Locale } from "@/i18n/config";
import type { Spec, SpecText } from "@/lib/data";

export function specText(text: SpecText | undefined, locale: Locale): string {
  if (!text) return "";
  if (typeof text !== "string") return pick(text, locale);
  // French decimals use a comma: "51.2" → "51,2".
  return locale === "fr" ? text.replace(/(\d)\.(\d)/g, "$1,$2") : text;
}

/** "120 kVA", "Triphasée", "25 ans" */
export function specValue(spec: Spec, locale: Locale): string {
  const unit = specText(spec.unit, locale);
  const value = specText(spec.value, locale);
  return unit ? `${value} ${unit}` : value;
}

/** Specs that read as headline numbers on a product card. */
export function keySpecs(specs: Spec[], limit = 3): Spec[] {
  return specs.filter((spec) => typeof spec.value === "string" && /\d/.test(spec.value)).slice(0, limit);
}
