import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { SiteSettings } from "@/lib/data";
import { QuoteForm, type CatalogEntry } from "@/components/quote/quote-form";
import { ContactAside } from "@/components/quote/contact-aside";

type Props = { locale: Locale; dict: Dictionary; settings: SiteSettings; catalog: CatalogEntry[] };

export function QuoteSection({ locale, dict, settings, catalog }: Props) {
  return (
    <section id="devis-form" aria-labelledby="quote-title" className="border-t border-line bg-white">
      <div className="shell grid gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-28">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 id="quote-title" className="wide text-[clamp(1.625rem,3vw,2.625rem)] font-bold leading-[1.08] tracking-[-0.02em]">
            {dict.quote.title}
          </h2>
          <p className="mt-4 max-w-[40ch] text-lg leading-relaxed">{dict.quote.intro}</p>
          <div className="mt-8 hidden lg:block">
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
        <QuoteForm locale={locale} dict={dict.quote} basketDict={dict.basket} phone={settings.phone} catalog={catalog} offlineLabel={dict.pwa.offlineSending} />
      </div>
    </section>
  );
}
