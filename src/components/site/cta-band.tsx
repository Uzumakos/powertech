import Link from "next/link";
import { Zap } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";

/** Closing call to action on inner pages. */
export function CtaBand({ locale, dict }: { locale: Locale; dict: Dictionary["cta"] }) {
  return (
    <section aria-labelledby="cta-title" className="shell py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[var(--radius-frame)] bg-crimson px-6 py-12 sm:px-12 sm:py-16">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="absolute -right-10 -top-6 h-[140%] fill-white/[0.06] sm:right-6"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
        <div className="relative max-w-[40rem]">
          <h2 id="cta-title" className="wide text-[clamp(1.625rem,3.2vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
            {dict.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">{dict.body}</p>
          <Link href={`/${locale}/devis`} className="btn btn-lg btn-volt mt-8">
            <Zap aria-hidden className="size-4 fill-current" />
            {dict.button}
          </Link>
        </div>
      </div>
    </section>
  );
}
