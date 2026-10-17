import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { format, pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getProducts, getSettings } from "@/lib/data";
import { submitPreorder } from "@/app/actions/preorder";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { StockBadge } from "@/components/catalog/stock-badge";
import { PreorderForm } from "@/components/quote/preorder-form";

export async function generateStaticParams() {
  const products = await getProducts();
  const open = products.filter((product) => product.preorderEnabled);
  // At least one entry is required; unknown slugs render on demand.
  return (open.length ? open : products.slice(0, 1)).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/precommande/[slug]">): Promise<Metadata> {
  const [{ slug }, locale, dict, products] = await Promise.all([params, getLocale(), getDictionary(), getProducts()]);
  const product = products.find((item) => item.slug === slug);
  return product ? { title: `${dict.preorder.title} : ${pick(product.name, locale)}`, robots: { index: false } } : {};
}

export default async function PreorderPage({ params }: PageProps<"/[lang]/precommande/[slug]">) {
  const [{ slug }, locale, dict, settings, products] = await Promise.all([params, getLocale(), getDictionary(), getSettings(), getProducts()]);
  const product = products.find((item) => item.slug === slug);
  if (!product || !product.preorderEnabled) notFound();

  const name = pick(product.name, locale);
  const productHref = `/${locale}/produits/${product.slug}`;

  return (
    <>
      <PageHeader
        title={`${dict.preorder.title} : ${name}`}
        intro={dict.preorder.intro}
        crumbs={[
          { href: `/${locale}`, label: dict.nav.home },
          { href: `/${locale}/produits`, label: dict.nav.products },
          { href: productHref, label: name },
          { label: dict.preorder.title },
        ]}
        breadcrumbLabel={dict.common.breadcrumb}
      />
      <div className="shell grid gap-8 pb-20 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
        <aside className="self-start overflow-hidden rounded-[var(--radius-frame)] border border-line bg-white lg:sticky lg:top-32">
          <div className="relative aspect-[4/3] bg-mist">
            {product.imageUrls[0] && <MediaImage src={product.imageUrls[0]} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />}
          </div>
          <div className="p-6">
            <p className="text-lg font-semibold leading-snug text-ink">{name}</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed">{pick(product.summary, locale)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StockBadge status={product.stockStatus} label={dict.catalog.status[product.stockStatus]} />
              {product.leadTime && (
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <CalendarClock aria-hidden className="size-4 text-muted" />
                  {format(dict.product.leadTime, { time: pick(product.leadTime, locale) })}
                </span>
              )}
            </div>
            <Link href={productHref} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:underline">
              <ArrowLeft aria-hidden className="size-4" />
              {dict.preorder.back}
            </Link>
          </div>
        </aside>
        <PreorderForm
          locale={locale}
          action={submitPreorder.bind(null, product.slug)}
          quote={dict.quote}
          dict={dict.preorder}
          phone={settings.phone}
          productHref={productHref}
          offlineLabel={dict.pwa.offlineSending}
        />
      </div>
    </>
  );
}
