"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeCookie, type Locale } from "@/i18n/config";

type Props = {
  current: Locale;
  label: string;
  /** Visible text; defaults to the target language code. */
  text?: string;
  className?: string;
};

/** Links to the same page in the other language and remembers the choice. */
export function LanguageSwitch({ current, label, text, className = "" }: Props) {
  const pathname = usePathname();
  const target: Locale = current === "fr" ? "en" : "fr";
  const href = pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${target}`) || `/${target}`;
  const visible = text ?? target.toUpperCase();
  // The spoken name must start with the visible text ("EN — Read this site in English").
  const ariaLabel = text ? undefined : `${visible} — ${label}`;

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={ariaLabel}
      title={label}
      onClick={() => {
        document.cookie = `${localeCookie}=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={className}
    >
      {visible}
    </Link>
  );
}
