import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";
import { LegalPage, legalVars } from "@/components/site/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.legal.privacyTitle, description: dict.legal.privacyIntro, alternates: localeAlternates(await getLocale(), "/confidentialite") };
}

export default async function PrivacyPage() {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);
  return (
    <LegalPage
      title={dict.legal.privacyTitle}
      intro={dict.legal.privacyIntro}
      sections={dict.legal.privacy}
      vars={legalVars(dict.legal, settings, locale)}
      updated={dict.legal.updated}
      crumbs={[{ href: `/${locale}`, label: dict.nav.home }, { label: dict.legal.privacyTitle }]}
      breadcrumbLabel={dict.common.breadcrumb}
    />
  );
}
