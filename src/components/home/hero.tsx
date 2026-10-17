import Link from "next/link";
import { Zap } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { format, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { SiteSettings } from "@/lib/data";

type Props = { locale: Locale; dict: Dictionary["hero"]; settings: SiteSettings };

export function Hero({ locale, dict, settings }: Props) {
  const years = settings.yearsActive;
  const stats = [
    { value: format(dict.stats.yearsValue, { years }), label: dict.stats.yearsLabel },
    { value: dict.stats.transferValue, label: dict.stats.transferLabel },
    { value: dict.stats.supportValue, label: dict.stats.supportLabel },
  ];

  return (
    <section aria-labelledby="hero-title" className="p-2 sm:p-3 lg:p-4">
      <div className="relative isolate flex min-h-[max(42rem,calc(100svh-1rem))] overflow-hidden rounded-[var(--radius-frame)] bg-night sm:min-h-[max(44rem,calc(100svh-1.5rem))] lg:min-h-[max(46rem,calc(100svh-2rem))]">
        <MediaImage
          src={settings.heroImageUrl}
          alt={pick(settings.heroImageAlt, locale)}
          fill
          preload
          sizes="100vw"
          className="hero-photo -z-30 object-cover"
        />
        {/* Darkens the sky slightly for the giant word and the floor heavily for the copy. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,rgb(11_15_25/0.35)_0%,rgb(11_15_25/0)_30%,rgb(11_15_25/0)_42%,rgb(11_15_25/0.55)_66%,rgb(11_15_25/0.9)_100%)]"
        />

        <p
          aria-hidden
          className="hero-word wide pointer-events-none absolute inset-x-0 top-24 -z-10 select-none bg-gradient-to-b from-white/90 via-white/55 to-white/0 bg-clip-text text-center text-[clamp(2.75rem,16vw,18rem)] font-extrabold uppercase leading-none tracking-[-0.035em] pt-[0.1em] text-transparent sm:top-28 lg:top-32"
        >
          {dict.word}
        </p>

        <div className="shell relative mt-auto grid gap-8 pb-5 pt-[clamp(14rem,calc(7rem+17vw),26rem)] sm:pb-8 lg:pb-10 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end xl:gap-12">
          <div className="hero-copy min-w-0 max-w-[46rem]">
            <h1
              id="hero-title"
              className="wide text-[clamp(1.75rem,min(9vw,2.6vw+2.6rem),4.75rem)] font-bold leading-[1.02] tracking-[-0.025em] text-white"
            >
              {dict.title}
            </h1>
            <p className="mt-5 max-w-[36rem] text-base leading-relaxed text-white/80 sm:text-lg">
              {dict.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Link href={`/${locale}/devis`} className="btn btn-lg btn-volt">
                <Zap aria-hidden className="size-4 fill-current" />
                {dict.primaryCta}
              </Link>
              <Link href={`/${locale}#realisations`} className="btn btn-lg btn-outline">
                {dict.secondaryCta}
              </Link>
            </div>
          </div>

          <dl className="hero-stats grid max-w-[40rem] grid-cols-3 gap-2 sm:gap-3 xl:w-[33rem]">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="@container flex min-w-0 flex-col-reverse justify-end rounded-[var(--radius-card)] border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-5"
              >
                <dt className="mt-2 text-xs leading-snug text-white/75 sm:text-sm">{stat.label}</dt>
                <dd className="wide whitespace-nowrap text-[clamp(0.875rem,13cqi,1.875rem)] font-bold tabular-nums leading-none text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
