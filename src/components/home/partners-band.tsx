/* eslint-disable @next/next/no-img-element -- partner logos can come from any host */
import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Partner } from "@/lib/data";
import { SectionHeading } from "@/components/site/section-heading";

type Props = { partners: Partner[]; dict: Dictionary["partners"]; newTabLabel: string };

export function PartnersBand({ partners, dict, newTabLabel }: Props) {
  const clients = partners.filter((partner) => partner.kind === "client");
  const brands = partners.filter((partner) => partner.kind === "brand");
  if (partners.length === 0) return null;

  return (
    <section aria-labelledby="partners-title" className="border-y border-line bg-white py-16 sm:py-20 lg:py-24">
      <div className="shell">
        <SectionHeading id="partners-title" title={dict.title} intro={dict.subtitle} />
      </div>

      <div className="mt-10 space-y-3 sm:mt-12 sm:space-y-4">
        {clients.length > 0 && <MarqueeRow label={dict.clients} items={clients} newTabLabel={newTabLabel} />}
        {brands.length > 0 && <MarqueeRow label={dict.brands} items={brands} newTabLabel={newTabLabel} reverse />}
      </div>
    </section>
  );
}

/**
 * An endless row of logos. The list is repeated until one copy is wider than
 * any screen, then rendered twice so the -50% translate loops seamlessly.
 * Hover or keyboard focus pauses it; with reduced motion it becomes a static,
 * wrapped row of each logo once.
 */
function MarqueeRow({
  label,
  items,
  reverse = false,
  newTabLabel,
}: {
  label: string;
  items: Partner[];
  reverse?: boolean;
  newTabLabel: string;
}) {
  const repeats = Math.max(1, Math.ceil(12 / items.length));
  const copy = Array.from({ length: repeats }, () => items).flat();
  // Duration scales with length so every row moves at the same speed.
  const style: CSSProperties = { animationDuration: `${copy.length * 4.5}s` };

  const renderList = (duplicate: boolean) => (
    <ul
      aria-hidden={duplicate || undefined}
      className={`flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0 ${
        duplicate ? "motion-reduce:hidden" : "motion-reduce:w-full"
      }`}
    >
      {copy.map((partner, index) => {
        const repeat = duplicate || index >= items.length;
        return (
          <li key={`${partner.id}-${index}`} aria-hidden={(!duplicate && repeat) || undefined} className={repeat ? "motion-reduce:hidden" : undefined}>
            <PartnerTile partner={partner} focusable={!repeat} newTabLabel={newTabLabel} />
          </li>
        );
      })}
    </ul>
  );

  return (
    <div role="group" aria-label={label} className="group">
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:[mask-image:none]">
        <div
          style={style}
          className={`flex w-max group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-full motion-reduce:px-4 ${
            reverse ? "motion-safe:animate-marquee-reverse" : "motion-safe:animate-marquee"
          }`}
        >
          {renderList(false)}
          {renderList(true)}
        </div>
      </div>
    </div>
  );
}

function PartnerTile({ partner, focusable, newTabLabel }: { partner: Partner; focusable: boolean; newTabLabel: string }) {
  const content = partner.logoUrl ? (
    <img
      src={partner.logoUrl}
      alt={partner.name}
      loading="lazy"
      className="max-h-11 w-auto max-w-full object-contain opacity-75 grayscale transition duration-300 group-hover/tile:opacity-100 group-hover/tile:grayscale-0"
    />
  ) : (
    <span className="wide text-center text-[0.9375rem] font-bold leading-tight tracking-[-0.01em] text-ink/70 transition-colors duration-300 group-hover/tile:text-crimson">
      {partner.name}
    </span>
  );

  const tileClass =
    "group/tile flex h-20 w-44 items-center justify-center rounded-[var(--radius-card)] border border-line bg-white px-5 sm:h-24 sm:w-56";

  if (!partner.websiteUrl) return <div className={tileClass}>{content}</div>;
  return (
    <a
      href={partner.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={focusable ? undefined : -1}
      className={tileClass}
    >
      {content}
      <span className="sr-only">{newTabLabel}</span>
    </a>
  );
}
