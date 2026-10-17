import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { format, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { SiteSettings } from "@/lib/data";
import { telHref, whatsappHref } from "@/lib/contact";
import { LanguageSwitch } from "./language-switch";
import { Logo } from "./logo";
import type { NavItem } from "./site-header";

type Props = {
  locale: Locale;
  dict: Dictionary;
  settings: SiteSettings;
  nav: NavItem[];
};

// Footer links repeat the main navigation, so they don't prefetch on sight:
// on short pages that would fetch ten routes at once on the visitor's phone.
export function SiteFooter({ locale, dict, settings, nav }: Props) {
  const contact = [
    { icon: Phone, label: settings.phone, href: telHref(settings.phone), numeric: true },
    { icon: MessageCircle, label: `${dict.footer.whatsapp} ${settings.whatsapp}`, href: whatsappHref(settings.whatsapp), external: true, numeric: true },
    { icon: Mail, label: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: pick(settings.address, locale) },
    { icon: Clock, label: pick(settings.hours, locale) },
  ];

  return (
    <footer className="on-dark bg-night text-white/65">
      <div className="shell grid gap-12 py-16 sm:py-20 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.3fr] lg:gap-16">
        <div className="md:col-span-2 lg:col-span-1">
          <Logo companyName={settings.companyName} src={settings.logoDarkUrl} tone="dark" />
          <p className="wide mt-7 max-w-[18ch] text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-[1.75rem]">
            {dict.footer.tagline}
          </p>
          <p className="mt-4 max-w-[40ch] text-[0.9375rem] leading-relaxed">{dict.footer.about}</p>
        </div>

        <nav aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" className="text-sm font-semibold text-white">
            {dict.footer.navTitle}
          </h2>
          <ul className="mt-5 space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link prefetch={false} href={item.href} className="inline-flex min-h-10 items-center transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-white">{dict.footer.contactTitle}</h2>
          <ul className="mt-5 space-y-3">
            {contact.map(({ icon: Icon, label, href, external, numeric }) => {
              const body = (
                <>
                  <Icon aria-hidden className="mt-0.5 size-[1.125rem] shrink-0 text-volt" />
                  <span className={numeric ? "tabular-nums" : undefined}>{label}</span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex gap-3 transition-colors hover:text-white"
                    >
                      {body}
                      {external && <span className="sr-only">{dict.common.newTab}</span>}
                    </a>
                  ) : (
                    <p className="flex gap-3">{body}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-night-line">
        <div className="shell flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            {format(dict.footer.copyright, {
              from: settings.foundedYear,
              to: settings.currentYear,
              years: settings.yearsActive,
            })}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link prefetch={false} href={`/${locale}/mentions-legales`} className="inline-flex min-h-10 items-center transition-colors hover:text-white">
              {dict.legal.noticeTitle}
            </Link>
            <Link prefetch={false} href={`/${locale}/confidentialite`} className="inline-flex min-h-10 items-center transition-colors hover:text-white">
              {dict.legal.privacyTitle}
            </Link>
            <LanguageSwitch
              current={locale}
              label={dict.header.switchLanguageLabel}
              text={dict.header.switchLanguage}
              className="inline-flex min-h-10 items-center font-semibold text-white/80 transition-colors hover:text-white"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
