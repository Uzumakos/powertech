import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href?: string; label: string };

type Props = {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  breadcrumbLabel?: string;
  children?: ReactNode;
};

/** Top of every inner page; leaves room for the floating header. */
export function PageHeader({ title, intro, crumbs, breadcrumbLabel, children }: Props) {
  return (
    <header className="shell pb-10 pt-32 sm:pb-12 sm:pt-36 lg:pt-44">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label={breadcrumbLabel} className="mb-6">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden className="text-line">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted transition-colors hover:text-crimson">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-ink">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="wide max-w-[22ch] text-[clamp(2rem,4.6vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.025em]">
        {title}
      </h1>
      {intro && <p className="mt-5 max-w-[60ch] text-lg leading-relaxed">{intro}</p>}
      {children}
    </header>
  );
}
