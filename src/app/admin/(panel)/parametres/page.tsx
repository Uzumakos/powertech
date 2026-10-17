import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { saveSettings } from "@/lib/admin/actions";
import { settingsFields } from "@/lib/admin/entities";
import { getMediaOptions } from "@/lib/admin/data";
import { EntityForm } from "@/components/admin/entity-form";
import { PageTitle } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, media] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    getMediaOptions(supabase),
  ]);

  return (
    <>
      <PageTitle
        title="Paramètres"
        intro="Coordonnées, logos et photo de bannière. Ces informations apparaissent sur toutes les pages, en français et en anglais."
      />
      <EntityForm fields={settingsFields} initial={data ?? {}} action={saveSettings} media={media} />
    </>
  );
}

// Admin pages read the session and live data on every request; they are not
// meant to be instant (prerendered) navigations, so skip that validation.
export const instant = false;
