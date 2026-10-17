import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";
import { Check } from "lucide-react";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getServices } from "@/lib/data";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.service, description: dict.sav.intro, alternates: localeAlternates(await getLocale(), "/sav") };
}

export default async function ServicePage() {
  const [locale, dict, services] = await Promise.all([getLocale(), getDictionary(), getServices()]);

  return (
    <>
      <PageHeader
        title={dict.sav.title}
        intro={dict.sav.intro}
        crumbs={[{ href: `/${locale}`, label: dict.nav.home }, { label: dict.nav.service }]}
        breadcrumbLabel={dict.common.breadcrumb}
      />

      <section aria-labelledby="process-title" className="shell pb-16 sm:pb-20">
        <h2 id="process-title" className="sr-only">
          {dict.sav.processTitle}
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {dict.sav.steps.map((step, index) => (
            <li key={step.title} className="relative rounded-[var(--radius-card)] border border-line bg-white p-6">
              <span className="wide text-4xl font-extrabold tabular-nums text-crimson">{index + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="services-title" className="border-y border-line bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <SectionHeading id="services-title" title={dict.sav.servicesTitle} />
          <ul className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
            {services.map((service) => (
              <li key={service.id} id={service.slug} className="grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-mist sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="relative aspect-[16/9] sm:aspect-auto">
                  {service.imageUrl && (
                    <MediaImage src={service.imageUrl} alt="" fill sizes="(min-width: 768px) 20vw, 100vw" className="object-cover" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="wide text-xl font-bold tracking-[-0.01em]">{pick(service.name, locale)}</h3>
                  <p className="mt-2 font-medium text-ink">{pick(service.summary, locale)}</p>
                  <p className="mt-3 leading-relaxed">{pick(service.description, locale)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="contract-title" className="shell py-16 sm:py-20 lg:py-24">
        <div className="on-dark grid gap-8 rounded-[var(--radius-frame)] bg-night p-6 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:p-14">
          <h2 id="contract-title" className="wide text-[clamp(1.625rem,3vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
            {dict.sav.contractTitle}
          </h2>
          <ul className="grid gap-3">
            {dict.sav.contractItems.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-night-line bg-night-2 p-4 text-white/85">
                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-volt" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand locale={locale} dict={dict.cta} />
    </>
  );
}
