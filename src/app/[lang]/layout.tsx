import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { format, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";
import { telHref } from "@/lib/contact";
import { Logo } from "@/components/site/logo";
import { SiteHeader, type NavItem } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PwaClient } from "@/components/pwa/pwa-client";
import "../globals.css";

const archivo = Archivo({
  // French accents are all in "latin"; "latin-ext" would double the font weight.
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const [dict, settings] = await Promise.all([getDictionary(), getSettings()]);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: dict.meta.title, template: `%s | ${settings.companyName}` },
    description: format(dict.meta.description, { founded: settings.foundedYear }),
    applicationName: dict.pwa.appName,
    icons: { apple: "/icons/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: dict.pwa.appName, statusBarStyle: "default" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f8fafc",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);

  const nav: NavItem[] = [
    { href: `/${locale}#solutions`, label: dict.nav.solutions },
    { href: `/${locale}/produits`, label: dict.nav.products },
    { href: `/${locale}/sav`, label: dict.nav.service },
    { href: `/${locale}#realisations`, label: dict.nav.projects },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];
  const footerNav: NavItem[] = [
    ...nav.slice(0, 4),
    { href: `/${locale}/a-propos`, label: dict.nav.about },
    ...nav.slice(4),
    { href: `/${locale}/devis`, label: dict.nav.quote },
  ];

  return (
    <html lang={locale} className={`${archivo.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          {dict.common.skipToContent}
        </a>
        <SiteHeader
          locale={locale}
          logo={<Logo companyName={settings.companyName} src={settings.logoUrl} />}
          nav={nav}
          labels={dict.header}
          homeLabel={dict.nav.home}
          basketLabel={dict.basket.headerLabel}
          phone={settings.phone}
          phoneHref={telHref(settings.phone)}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} settings={settings} nav={footerNav} />
        <PwaClient labels={dict.pwa} />
      </body>
    </html>
  );
}
