import { Landmark, ShieldCheck, Wrench } from "lucide-react";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { SectionHeading } from "@/components/site/section-heading";

const icons = [ShieldCheck, Wrench, Landmark];

export function WhySection({ dict, years }: { dict: Dictionary["why"]; years: number }) {
  return (
    <section aria-labelledby="why-title" className="shell py-20 sm:py-24 lg:py-28">
      <SectionHeading id="why-title" title={dict.title} intro={dict.intro} />
      <ul className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 md:grid-cols-3">
        {dict.items.map((item, index) => {
          const Icon = icons[index] ?? ShieldCheck;
          return (
            <li key={item.title} className="rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8">
              <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-crimson text-white">
                <Icon className="size-6" strokeWidth={1.75} />
              </span>
              <h3 className="wide mt-6 text-xl font-bold tracking-[-0.01em]">{format(item.title, { years })}</h3>
              <p className="mt-3 leading-relaxed">{item.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
