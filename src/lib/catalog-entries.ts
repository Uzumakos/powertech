import { pick, type Locale } from "@/i18n/config";
import type { Product } from "@/lib/data";
import type { CatalogEntry } from "@/components/quote/quote-form";

/** The minimum the quote basket needs to display a product. */
export function toCatalogEntries(products: Product[], locale: Locale): CatalogEntry[] {
  return products.map((product) => ({
    slug: product.slug,
    name: pick(product.name, locale),
    image: product.imageUrls[0] ?? null,
  }));
}
