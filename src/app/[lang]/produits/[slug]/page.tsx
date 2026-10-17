import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileDown, PackageCheck, Phone } from "lucide-react";
import { AddToQuote } from "@/components/quote/add-to-quote";
import { format, pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getCategories, getProduct, getProducts, getSettings } from "@/lib/data";
import { telHref } from "@/lib/contact";
import { specValue } from "@/lib/specs";
import { jsonLd, localeAlternates, siteUrl } from "@/lib/seo";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { ProductCard } from "@/components/catalog/product-card";
import { StockBadge } from "@/components/catalog/stock-badge";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/produits/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: pick(product.name, locale),
    description: pick(product.summary, locale),
    alternates: localeAlternates(locale, `/produits/${product.slug}`),
    openGraph: product.imageUrls[0] ? { images: [product.imageUrls[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/produits/[slug]">) {
  const [{ slug }, locale, dict, settings, categories, products] = await Promise.all([
    params,
    getLocale(),
    getDictionary(),
    getSettings(),
    getCategories(),
    getProducts(),
  ]);
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const name = pick(product.name, locale);
  const category = categories.find((item) => item.slug === product.categorySlug);
  const categoryName = category ? pick(category.name, locale) : undefined;
  const related = products
    .filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id)
    .slice(0, 3);
  const [mainImage, ...moreImages] = product.imageUrls;

  // Structured data: lets search engines show the product with its specs.
  // No price is published (quote on request), so no "offers" block.
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: pick(product.description, locale) || pick(product.summary, locale),
    image: product.imageUrls,
    url: `${siteUrl()}/${locale}/produits/${product.slug}`,
    category: categoryName,
    brand: { "@type": "Organization", name: settings.companyName },
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: pick(spec.label, locale),
      value: specValue(spec, locale),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productData)} />
      <PageHeader
        title={name}
        crumbs={[
          { href: `/${locale}`, label: dict.nav.home },
          { href: `/${locale}/produits`, label: dict.nav.products },
          ...(category ? [{ href: `/${locale}/produits?categorie=${category.slug}`, label: categoryName! }] : []),
          { label: name },
        ]}
        breadcrumbLabel={dict.common.breadcrumb}
      >
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed">{pick(product.summary, locale)}</p>
      </PageHeader>

      <div className="shell grid gap-8 pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-frame)] border border-line bg-white">
            {mainImage && (
              <MediaImage src={mainImage} alt={name} fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            )}
          </div>
          {moreImages.length > 0 && (
            <ul className="grid grid-cols-3 gap-3">
              {moreImages.map((url, index) => (
                <li key={url} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                  <MediaImage
                    src={url}
                    alt={format(dict.product.gallery, { index: index + 2, total: product.imageUrls.length })}
                    fill
                    sizes="18vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-[var(--radius-frame)] border border-line bg-white p-6 sm:p-8">
            {categoryName && <p className="text-sm font-medium text-crimson">{categoryName}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StockBadge status={product.stockStatus} label={dict.catalog.status[product.stockStatus]} />
              {product.leadTime && (
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <CalendarClock aria-hidden className="size-4 text-muted" />
                  {format(dict.product.leadTime, { time: pick(product.leadTime, locale) })}
                </span>
              )}
            </div>
            <p className="wide mt-6 text-2xl font-bold text-ink">{dict.catalog.priceOnRequest}</p>
            {product.preorderEnabled && (
              <p className="mt-3 rounded-[var(--radius-field)] bg-crimson/[0.06] px-4 py-3 text-[0.9375rem] text-crimson-deep">
                {dict.product.preorderNote}
              </p>
            )}
            <div className="mt-6 grid gap-2">
              <AddToQuote slug={product.slug} labels={dict.basket} quoteHref={`/${locale}/devis`} />
              {product.preorderEnabled && (
                <Link href={`/${locale}/precommande/${product.slug}`} className="btn btn-lg btn-outline">
                  <PackageCheck aria-hidden className="size-4" />
                  {dict.preorder.cta}
                </Link>
              )}
              {product.datasheetUrl && (
                <a href={product.datasheetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-outline">
                  <FileDown aria-hidden className="size-4" />
                  {dict.product.datasheet}
                  <span className="sr-only">{dict.common.newTab}</span>
                </a>
              )}
            </div>
            <div className="mt-6 border-t border-line pt-5 text-[0.9375rem]">
              <p className="font-semibold text-ink">{dict.product.question}</p>
              <a href={telHref(settings.phone)} className="mt-1 inline-flex items-center gap-2 tabular-nums text-crimson hover:underline">
                <Phone aria-hidden className="size-4" />
                {format(dict.product.callUs, { phone: settings.phone })}
              </a>
            </div>
          </div>
        </aside>

        <section aria-labelledby="specs-title" className="lg:col-start-1">
          <h2 id="specs-title" className="wide text-2xl font-bold tracking-[-0.01em]">
            {dict.product.specs}
          </h2>
          <dl className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {product.specs.map((spec) => (
              <div key={spec.key} className="grid gap-1 border-b border-line px-5 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[0.9375rem]">{pick(spec.label, locale)}</dt>
                <dd className="font-semibold tabular-nums text-ink">{specValue(spec, locale)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="description-title" className="lg:col-start-1">
          <h2 id="description-title" className="wide text-2xl font-bold tracking-[-0.01em]">
            {dict.product.description}
          </h2>
          <p className="mt-4 max-w-[68ch] text-lg leading-relaxed">{pick(product.description, locale)}</p>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line bg-white py-16 sm:py-20">
          <div className="shell">
            <h2 id="related-title" className="wide text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
              {dict.product.related}
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {related.map((item) => (
                <li key={item.id} className="flex">
                  <ProductCard product={item} categoryName={categoryName} locale={locale} dict={dict.catalog} basketLabels={dict.basket} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
