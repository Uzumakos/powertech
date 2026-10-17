import { MediaImage } from "@/components/media-image";
import { SectionHeading } from "@/components/site/section-heading";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Project } from "@/lib/data";

export function ProjectsSection({ projects, locale, dict }: { projects: Project[]; locale: Locale; dict: Dictionary["projects"] }) {
  if (projects.length === 0) return null;

  return (
    <section id="realisations" aria-labelledby="projects-title" className="shell py-20 sm:py-24 lg:py-28">
      <SectionHeading id="projects-title" title={dict.title} kicker={dict.subtitle} intro={dict.intro} />
      <ul className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <li key={project.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            <div className="relative aspect-[16/10] bg-mist">
              {project.imageUrl && (
                <MediaImage
                  src={project.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 46vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-sm font-semibold text-crimson">
                {project.client}
                {project.year && <span className="font-normal text-muted"> · {project.year}</span>}
              </p>
              <h3 className="wide mt-2 text-xl font-bold leading-snug tracking-[-0.01em] sm:text-2xl">
                {pick(project.title, locale)}
              </h3>
              <p className="mt-3 leading-relaxed">{pick(project.summary, locale)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
