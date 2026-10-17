import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, Zap, type LucideIcon } from "lucide-react";
import { pick } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";
import { telHref, whatsappHref } from "@/lib/contact";
import { PageHeader } from "@/components/site/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.contact, description: dict.contact.intro, alternates: localeAlternates(await getLocale(), "/contact") };
}

export default async function ContactPage() {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);
  const address = pick(settings.address, locale);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.companyName}, ${address}`)}`;

  const channels: { icon: LucideIcon; title: string; value: string; href: string; external?: boolean; numeric?: boolean }[] = [
    { icon: Phone, title: dict.contact.call, value: settings.phone, href: telHref(settings.phone), numeric: true },
    { icon: MessageCircle, title: dict.contact.whatsapp, value: settings.whatsapp, href: whatsappHref(settings.whatsapp), external: true, numeric: true },
    { icon: Mail, title: dict.contact.email, value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, title: dict.contact.visit, value: address, href: mapHref, external: true },
  ];

  return (
    <>
      <PageHeader
        title={dict.contact.title}
        intro={dict.contact.intro}
        crumbs={[{ href: `/${locale}`, label: dict.nav.home }, { label: dict.nav.contact }]}
        breadcrumbLabel={dict.common.breadcrumb}
      />

      <div className="shell grid gap-8 pb-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
        <div>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {channels.map(({ icon: Icon, title, value, href, external, numeric }) => (
              <li key={title} className="flex">
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex w-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 transition-colors hover:border-ink/30"
                >
                  <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-crimson text-white">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <span className="mt-5 font-semibold text-ink">{title}</span>
                  <span className={`mt-1 break-words text-crimson group-hover:underline ${numeric ? "tabular-nums" : ""}`}>{value}</span>
                  {external && <span className="sr-only">{dict.common.newTab}</span>}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-4 rounded-[var(--radius-card)] border border-line bg-white p-6">
            <Clock aria-hidden className="mt-0.5 size-6 shrink-0 text-crimson" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-ink">{dict.contact.hours}</p>
              <p className="mt-1">{pick(settings.hours, locale)}</p>
            </div>
          </div>
        </div>

        <aside className="on-dark self-start rounded-[var(--radius-frame)] bg-night p-6 sm:p-8">
          <h2 className="wide text-2xl font-bold leading-tight text-white">{dict.contact.quoteTitle}</h2>
          <p className="mt-3 leading-relaxed text-white/70">{dict.contact.quoteBody}</p>
          <Link href={`/${locale}/devis`} className="btn btn-lg btn-volt mt-6 w-full sm:w-auto">
            <Zap aria-hidden className="size-4 fill-current" />
            {dict.header.quoteCta}
          </Link>
        </aside>
      </div>
    </>
  );
}
