import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Category, Service } from "@/lib/data";
import { SolutionPanels, type SolutionKey, type SolutionPanel } from "./solution-panels";

type Props = {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
  services: Service[];
};

export function SolutionsSection({ locale, dict, categories, services }: Props) {
  const imageOf = (slug: string) => categories.find((category) => category.slug === slug)?.imageUrl ?? null;
  const serviceImage = services.find((service) => service.slug === "contrat-sav")?.imageUrl ?? services[0]?.imageUrl ?? null;

  const catalogLink = (slug: string) => ({
    href: `/${locale}/produits?categorie=${slug}`,
    linkLabel: dict.solutions.seeProducts,
    imageUrl: imageOf(slug),
  });
  const links: Record<SolutionKey, Pick<SolutionPanel, "href" | "linkLabel" | "imageUrl">> = {
    solar: catalogLink("solaire"),
    ups: catalogLink("ups"),
    generator: catalogLink("generateurs"),
    service: { href: `/${locale}/sav`, linkLabel: dict.solutions.seeService, imageUrl: serviceImage },
  };

  const order: SolutionKey[] = ["solar", "ups", "generator", "service"];
  const panels: SolutionPanel[] = order.map((key) => ({ key, ...dict.solutions.items[key], ...links[key] }));

  return (
    <section id="solutions" aria-labelledby="solutions-title" className="on-dark p-2 sm:p-3 lg:p-4">
      <div className="rounded-[var(--radius-frame)] bg-night py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <SectionHeading id="solutions-title" title={dict.solutions.title} intro={dict.solutions.intro} tone="dark" />
          <div className="mt-10 sm:mt-12">
            <SolutionPanels panels={panels} expandLabel={dict.solutions.expand} wave={dict.wave} />
          </div>
        </div>
      </div>
    </section>
  );
}
