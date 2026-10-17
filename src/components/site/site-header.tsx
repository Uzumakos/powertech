"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ClipboardList, Menu, Phone, X, Zap } from "lucide-react";
import { format, type Locale } from "@/i18n/config";
import { useBasket } from "@/lib/basket";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { LanguageSwitch } from "./language-switch";

export type NavItem = { href: string; label: string };

type Props = {
  locale: Locale;
  logo: ReactNode;
  nav: NavItem[];
  labels: Dictionary["header"];
  homeLabel: string;
  basketLabel: string;
  phone: string;
  phoneHref: string;
};

export function SiteHeader({ locale, logo, nav, labels, homeLabel, basketLabel, phone, phoneHref }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const setOpen = (value: boolean) => setMenuPath(value ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuPath(null);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const basketCount = useBasket().reduce((total, item) => total + item.qty, 0);
  const solid = scrolled || open;
  const quoteHref = `/${locale}/devis`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-5 lg:pt-6">
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 bg-night/45 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <div className="shell">
        <div
          className={`mx-auto flex h-16 max-w-[78rem] items-center gap-2 rounded-full border pl-3 pr-2 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 sm:pl-4 ${
            solid ? "border-line bg-white/95 shadow-float" : "border-white/60 bg-white/70"
          }`}
        >
          <Link href={`/${locale}`} className="shrink-0 rounded-full">
            {logo}
            <span className="sr-only"> — {homeLabel}</span>
          </Link>

          <nav aria-label={labels.primaryNav} className="mx-auto hidden lg:block">
            <ul className="flex items-center">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap rounded-full px-3 py-2 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-ink/5 xl:px-3.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <a
              href={phoneHref}
              className="hidden items-center gap-2 whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-sm font-semibold tabular-nums text-ink transition-colors hover:bg-ink/5 min-[1440px]:inline-flex"
            >
              <span className="grid size-8 place-items-center rounded-full bg-crimson/10 text-crimson">
                <Phone aria-hidden className="size-4" />
              </span>
              {phone}
            </a>
            <a
              href={phoneHref}
              aria-label={labels.call}
              className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 min-[1440px]:hidden"
            >
              <Phone aria-hidden className="size-5" />
            </a>
            <LanguageSwitch
              current={locale}
              label={labels.switchLanguageLabel}
              className="hidden size-11 place-items-center rounded-full text-sm font-semibold text-ink transition-colors hover:bg-ink/5 sm:grid"
            />
            {basketCount > 0 && (
              <Link
                href={quoteHref}
                aria-label={format(basketLabel, { count: basketCount })}
                className="relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
              >
                <ClipboardList aria-hidden className="size-5" />
                <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-crimson px-1 text-[0.6875rem] font-bold leading-5 text-white tabular-nums">
                  {basketCount}
                </span>
              </Link>
            )}
            <Link href={quoteHref} className="btn btn-volt hidden whitespace-nowrap sm:inline-flex">
              <Zap aria-hidden className="size-4 fill-current" />
              <span className="xl:hidden">{labels.quoteShort}</span>
              <span className="hidden xl:inline">{labels.quoteCta}</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? labels.closeMenu : labels.openMenu}
              className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
            >
              {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div
            id="mobile-menu"
            className="mx-auto mt-2 max-h-[calc(100dvh-6.5rem)] max-w-[78rem] overflow-y-auto rounded-[var(--radius-frame)] border border-line bg-white p-3 shadow-float lg:hidden"
          >
            <nav aria-label={labels.primaryNav}>
              <ul className="divide-y divide-line">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="wide flex min-h-14 items-center px-3 text-lg font-semibold text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link href={quoteHref} onClick={() => setOpen(false)} className="btn btn-lg btn-volt">
                <Zap aria-hidden className="size-4 fill-current" />
                {labels.quoteCta}
              </Link>
              <a href={phoneHref} className="btn btn-lg border border-line bg-mist text-ink tabular-nums">
                <Phone aria-hidden className="size-4 text-crimson" />
                {phone}
              </a>
            </div>
            <LanguageSwitch
              current={locale}
              label={labels.switchLanguageLabel}
              text={labels.switchLanguage}
              className="mt-2 flex min-h-12 items-center justify-center rounded-full text-sm font-semibold text-muted hover:text-ink"
            />
          </div>
        )}
      </div>
    </header>
  );
}
