import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo";
import { Landmark, ShieldCheck, Wrench } from "lucide-react";
import { format } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getPartners, getProjects, getSettings } from "@/lib/data";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";
import { Timeline } from "@/components/about/timeline";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.about, description: dict.about.intro, alternates: localeAlternates(await getLocale(), "/a-propos") };
}

const icons = [ShieldCheck, Wrench, Landmark];

export default async function AboutPage() {
  const [locale, dict, settings, projects, partners] = await Promise.all([
    getLocale(),
    getDictionary(),
    getSettings(),
    getProjects(),
    getPartners(),
  ]);
  const vars = { founded: settings.foundedYear, years: settings.yearsActive };
  const workshop = projects.find((project) => project.slug === "ateliers-magasin-central")?.imageUrl ?? settings.heroImageUrl;
  const clients = partners.filter((partner) => partner.kind === "client");
  const milestones = dict.about.timeline.map((item) => ({
    year: format(item.year, vars),
    title: format(item.title, vars),
    body: format(item.body, vars),
  }));

  return (
    <>
      <PageHeader
        title={dict.about.title}
        intro={dict.about.intro}
        crumbs={[{ href: `/${locale}`, label: dict.nav.home }, { label: dict.nav.about }]}
        breadcrumbLabel={dict.common.breadcrumb}
      />

      <section aria-labelledby="mission-title" className="shell grid gap-8 pb-16 sm:pb-20 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-frame)] bg-night lg:aspect-auto lg:min-h-[30rem]">
          <MediaImage src={workshop} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 id="mission-title" className="wide text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
            {dict.about.missionTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink">{dict.about.mission}</p>
          <h2 className="wide mt-10 text-2xl font-bold tracking-[-0.01em] sm:text-3xl">{dict.about.storyTitle}</h2>
          {dict.about.story.map((paragraph) => (
            <p key={paragraph} className="mt-4 max-w-[62ch] leading-relaxed">
              {format(paragraph, vars)}
            </p>
          ))}
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="on-dark p-2 sm:p-3 lg:p-4">
        <div className="rounded-[var(--radius-frame)] bg-night py-16 sm:py-20 lg:py-28">
          <div className="shell">
            <SectionHeading id="timeline-title" title={dict.about.timelineTitle} intro={dict.about.timelineIntro} tone="dark" />
            <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
              <Timeline items={milestones} />
            </div>
          </div>
        </div>
      </section>

      {clients.length > 0 && (
        <section aria-labelledby="clients-title" className="shell py-16 sm:py-20 lg:py-24">
          <SectionHeading id="clients-title" title={dict.about.clientsTitle} intro={dict.about.clientsIntro} />
          <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            {clients.map((client) => (
              <li
                key={client.id}
                className="flex min-h-20 items-center justify-center rounded-[var(--radius-card)] border border-line bg-white px-4 py-3 text-center"
              >
                {client.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- client logos can come from any host
                  <img src={client.logoUrl} alt={client.name} loading="lazy" className="max-h-10 w-auto max-w-full object-contain" />
                ) : (
                  <span className="wide text-[0.875rem] font-bold leading-tight text-ink/75 sm:text-[0.9375rem]">{client.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="values-title" className="border-y border-line bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 id="values-title" className="wide text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
            {dict.about.valuesTitle}
          </h2>
          <ul className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-3">
            {dict.why.items.map((item, index) => {
              const Icon = icons[index] ?? ShieldCheck;
              return (
                <li key={item.title} className="rounded-[var(--radius-card)] border border-line bg-mist p-6 sm:p-8">
                  <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-crimson text-white">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="wide mt-6 text-xl font-bold tracking-[-0.01em]">{format(item.title, vars)}</h3>
                  <p className="mt-3 leading-relaxed">{item.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand locale={locale} dict={dict.cta} />
    </>
  );
}
