import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getCategories, getProducts } from "@/lib/data";
import { PageHeader } from "@/components/site/page-header";
import { CtaBand } from "@/components/site/cta-band";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { SaveCatalog } from "@/components/pwa/save-catalog";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.catalog.title, description: dict.catalog.intro, alternates: localeAlternates(await getLocale(), "/produits") };
}

export default async function CatalogPage() {
  const [locale, dict, products, categories] = await Promise.all([
    getLocale(),
    getDictionary(),
    getProducts(),
    getCategories(),
  ]);
  const catalogProps = { products, categories, locale, dict: dict.catalog, basketDict: dict.basket };

  return (
    <>
      <PageHeader
        title={dict.catalog.title}
        intro={dict.catalog.intro}
        crumbs={[{ href: `/${locale}`, label: dict.nav.home }, { label: dict.nav.products }]}
        breadcrumbLabel={dict.common.breadcrumb}
      />
      <div className="shell">
        <CatalogBrowser {...catalogProps} />
        {/* Below the list: it only appears once the service worker controls
            the page, and must not push the products down when it does. */}
        <SaveCatalog
          locale={locale}
          labels={dict.pwa}
          urls={[
            `/${locale}`,
            `/${locale}/produits`,
            ...products.map((product) => `/${locale}/produits/${product.slug}`),
            `/${locale}/sav`,
            `/${locale}/contact`,
            `/${locale}/devis`,
          ]}
        />
      </div>
      <CtaBand locale={locale} dict={dict.cta} />
    </>
  );
}
