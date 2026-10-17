import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getRawDictionary } from "@/i18n/get-dictionary";
import frDefaults from "@/i18n/dictionaries/fr";
import enDefaults from "@/i18n/dictionaries/en";
import { TextsEditor } from "@/components/admin/texts-editor";
import { PageTitle } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Textes du site" };

export default async function TextsPage() {
  await requireAdmin();
  const [fr, en] = await Promise.all([getRawDictionary("fr"), getRawDictionary("en")]);

  return (
    <>
      <PageTitle
        title="Textes du site"
        intro="Tous les textes des pages publiques, en français et en anglais côte à côte. Les mots entre accolades, comme {years} ou {company}, sont remplacés automatiquement : gardez-les tels quels."
      />
      <TextsEditor fr={fr} en={en} defaults={{ fr: frDefaults, en: enDefaults }} />
    </>
  );
}

// Admin pages read the session and live data on every request; they are not
// meant to be instant (prerendered) navigations, so skip that validation.
export const instant = false;
