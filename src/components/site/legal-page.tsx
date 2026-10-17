import { Fragment, type ReactNode } from "react";
import { format, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { SiteSettings } from "@/lib/data";
import { PageHeader } from "./page-header";

type Section = { title: string; body: string };

/** Values from Settings; missing ones become a visible "[To complete: …]" marker. */
export function legalVars(dict: Dictionary["legal"], settings: SiteSettings, locale: Locale) {
  const missing = (field: keyof Dictionary["legal"]["fields"]) => format(dict.toComplete, { field: dict.fields[field] });
  const address = pick(settings.legalAddress, locale) || pick(settings.address, locale);
  return {
    legalForm: settings.legalForm || missing("legalForm"),
    legalAddress: address || missing("address"),
    taxId: settings.taxId || missing("taxId"),
    director: settings.publicationDirector || missing("director"),
    phone: settings.phone,
    email: settings.email,
  };
}

/** Highlights "[À compléter : …]" markers so they can't go unnoticed. */
function withMarkers(text: string): ReactNode {
  return text.split(/(\[[^\]]+\])/g).map((part, index) =>
    /^\[.+\]$/.test(part) ? (
      <mark key={index} className="rounded bg-volt/40 px-1 text-ink">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** Paragraphs separated by blank lines; lines starting with "- " form a list. */
function Body({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className="mt-3 list-disc space-y-1.5 pl-5">
              {lines.map((line) => (
                <li key={line}>{withMarkers(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="mt-3 leading-relaxed">
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {withMarkers(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

type Props = {
  title: string;
  intro?: string;
  sections: Section[];
  vars: Record<string, string>;
  updated: string;
  crumbs: { href?: string; label: string }[];
  breadcrumbLabel: string;
};

export function LegalPage({ title, intro, sections, vars, updated, crumbs, breadcrumbLabel }: Props) {
  return (
    <>
      <PageHeader title={title} intro={intro ? format(intro, vars) : undefined} crumbs={crumbs} breadcrumbLabel={breadcrumbLabel}>
        <p className="mt-4 text-sm">{updated}</p>
      </PageHeader>
      <div className="shell pb-20">
        <div className="max-w-[46rem] divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white px-6 sm:px-10">
          {sections.map((section) => (
            <section key={section.title} className="py-7">
              <h2 className="wide text-xl font-bold tracking-[-0.01em]">{section.title}</h2>
              <Body text={format(section.body, vars)} />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
