import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Phone, WifiOff } from "lucide-react";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";
import { telHref } from "@/lib/contact";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.pwa.offlineTitle, robots: { index: false } };
}

/** Shown by the service worker when a page that was never saved is opened offline. */
export default async function OfflinePage() {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);

  return (
    <section className="shell flex min-h-[75vh] flex-col items-start justify-center pb-16 pt-40">
      <span aria-hidden className="grid size-16 place-items-center rounded-2xl bg-night text-volt">
        <WifiOff className="size-8" />
      </span>
      <h1 className="wide mt-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{dict.pwa.offlineTitle}</h1>
      <p className="mt-4 max-w-[52ch] text-lg leading-relaxed">{dict.pwa.offlineBody}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/${locale}/produits`} className="btn btn-lg btn-volt">
          <Boxes aria-hidden className="size-4" />
          {dict.pwa.offlineCatalog}
        </Link>
        <a href={telHref(settings.phone)} className="btn btn-lg btn-outline tabular-nums">
          <Phone aria-hidden className="size-4" />
          {dict.pwa.offlineCall} · {settings.phone}
        </a>
      </div>
    </section>
  );
}
