import type { Metadata } from "next";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getCategories, getPartners, getProducts, getProjects, getServices, getSettings } from "@/lib/data";
import { toCatalogEntries } from "@/lib/catalog-entries";
import { jsonLd, localeAlternates, siteUrl } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { PartnersBand } from "@/components/home/partners-band";
import { WhySection } from "@/components/home/why-section";
import { SolutionsSection } from "@/components/home/solutions-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { QuoteSection } from "@/components/home/quote-section";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: localeAlternates(await getLocale(), "") };
}

export default async function HomePage() {
  const [locale, dict, settings, partners, categories, services, projects, products] = await Promise.all([
    getLocale(),
    getDictionary(),
    getSettings(),
    getPartners(),
    getCategories(),
    getServices(),
    getProjects(),
    getProducts(),
  ]);

  // Structured data: the business card search engines show for Powertech.
  const business = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl()}/#business`,
    name: settings.companyName,
    description: dict.meta.description,
    slogan: dict.footer.tagline,
    url: `${siteUrl()}/${locale}`,
    logo: settings.logoUrl ?? `${siteUrl()}/icons/icon-512.png`,
    image: settings.heroImageUrl,
    telephone: settings.phone,
    email: settings.email,
    foundingDate: String(settings.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: pick(settings.legalAddress, locale) || pick(settings.address, locale),
      addressLocality: "Port-au-Prince",
      addressCountry: "HT",
    },
    areaServed: { "@type": "Country", name: "Haiti" },
    knowsAbout: ["UPS", "Solar energy", "Lithium batteries", "Generators", "After-sales service"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(business)} />
      <Hero locale={locale} dict={dict.hero} settings={settings} />
      <PartnersBand partners={partners} dict={dict.partners} newTabLabel={dict.common.newTab} />
      <WhySection dict={dict.why} years={settings.yearsActive} />
      <SolutionsSection locale={locale} dict={dict} categories={categories} services={services} />
      <ProjectsSection projects={projects} locale={locale} dict={dict.projects} />
      <QuoteSection locale={locale} dict={dict} settings={settings} catalog={toCatalogEntries(products, locale)} />
    </>
  );
}
