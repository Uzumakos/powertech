import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getProducts } from "@/lib/data";
import { siteUrl } from "@/lib/seo";

const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/produits", priority: 0.9, changeFrequency: "weekly" },
  { path: "/sav", priority: 0.8, changeFrequency: "monthly" },
  { path: "/a-propos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/devis", priority: 0.8, changeFrequency: "monthly" },
  { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.2, changeFrequency: "yearly" },
];

/** Every public page in both languages, each listing its other-language version. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  const entries = [
    ...PAGES,
    ...products.map((product) => ({ path: `/produits/${product.slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
  ];

  return entries.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((code) => [code, `${base}/${code}${path}`])) },
    })),
  );
}
