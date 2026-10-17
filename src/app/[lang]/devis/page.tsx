import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getProducts, getSettings } from "@/lib/data";
import { toCatalogEntries } from "@/lib/catalog-entries";
import { PageHeader } from "@/components/site/page-header";
import { QuoteForm } from "@/components/quote/quote-form";
import { ContactAside } from "@/components/quote/contact-aside";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.devis.title, description: dict.devis.intro, alternates: localeAlternates(await getLocale(), "/devis") };
}

export default async function QuotePage() {
  const [locale, dict, settings, products] = await Promise.all([getLocale(), getDictionary(), getSettings(), getProducts()]);

  return (
    <>
      <PageHeader
        title={dict.devis.title}
        intro={dict.devis.intro}
        crumbs={[{ href: `/${locale}`, label: dict.nav.home }, { label: dict.nav.quote }]}
        breadcrumbLabel={dict.common.breadcrumb}
      />
      <div className="shell grid gap-8 pb-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-12">
        <QuoteForm locale={locale} dict={dict.quote} basketDict={dict.basket} phone={settings.phone} catalog={toCatalogEntries(products, locale)} offlineLabel={dict.pwa.offlineSending} />
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ContactAside
            title={dict.devis.asideTitle}
            body={dict.devis.asideBody}
            phone={settings.phone}
            whatsapp={settings.whatsapp}
            whatsappLabel={dict.contact.whatsapp}
            newTabLabel={dict.common.newTab}
          />
        </div>
      </div>
    </>
  );
}
