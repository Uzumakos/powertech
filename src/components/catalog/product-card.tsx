import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Product } from "@/lib/data";
import { keySpecs, specValue } from "@/lib/specs";
import { AddToQuote } from "@/components/quote/add-to-quote";
import { StockBadge } from "./stock-badge";

type Props = {
  product: Product;
  categoryName?: string;
  locale: Locale;
  dict: Dictionary["catalog"];
  /** Shows an "Add to quote" button when given. */
  basketLabels?: Dictionary["basket"];
};

export function ProductCard({ product, categoryName, locale, dict, basketLabels }: Props) {
  const name = pick(product.name, locale);
  const image = product.imageUrls[0];

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-colors hover:border-ink/25">
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        {image && (
          <MediaImage
            src={image}
            alt=""
            fill
            sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        )}
        <StockBadge status={product.stockStatus} label={dict.status[product.stockStatus]} className="absolute left-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {categoryName && <p className="text-[0.8125rem] font-medium text-crimson">{categoryName}</p>}
        <h3 className="mt-1 text-lg font-semibold leading-snug">
          <Link href={`/${locale}/produits/${product.slug}`} className="after:absolute after:inset-0">
            {name}
          </Link>
        </h3>
        <p className="mt-2 text-[0.9375rem] leading-relaxed">{pick(product.summary, locale)}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {keySpecs(product.specs).map((spec) => (
            <li key={spec.key} className="rounded-md bg-mist px-2 py-1 text-[0.8125rem] font-semibold tabular-nums text-ink">
              {specValue(spec, locale)}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="font-medium text-muted">{dict.priceOnRequest}</span>
          {basketLabels ? (
            <AddToQuote slug={product.slug} labels={basketLabels} quoteHref={`/${locale}/devis`} compact />
          ) : (
            <ArrowUpRight aria-hidden className="size-5 text-ink/40 transition-colors group-hover:text-crimson" />
          )}
        </div>
      </div>
    </article>
  );
}
