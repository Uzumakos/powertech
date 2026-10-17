import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteEntity, saveEntity } from "@/lib/admin/actions";
import { entityBySegment } from "@/lib/admin/entities";
import { getCategoryOptions, getMediaOptions } from "@/lib/admin/data";
import { EntityForm } from "@/components/admin/entity-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageTitle } from "@/components/admin/ui";

export async function generateMetadata({ params }: PageProps<"/admin/[entity]/[id]">): Promise<Metadata> {
  const { entity: segment, id } = await params;
  const entity = entityBySegment(segment);
  if (!entity) return {};
  return { title: id === "nouveau" ? `Nouveau ${entity.singular}` : `${entity.plural} · modifier` };
}

export default async function EntityEditPage({ params }: PageProps<"/admin/[entity]/[id]">) {
  const { entity: segment, id } = await params;
  const entity = entityBySegment(segment);
  if (!entity) notFound();

  const { supabase } = await requireAdmin();
  const isNew = id === "nouveau";

  let initial: Record<string, unknown> = {};
  if (!isNew) {
    const { data } = await supabase.from(entity.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    initial = data;
  }

  const [media, categories] = await Promise.all([
    getMediaOptions(supabase),
    entity.fields.some((field) => field.type === "category") ? getCategoryOptions(supabase) : Promise.resolve([]),
  ]);

  const titleValue = initial[entity.titleField];
  const title = isNew
    ? `Nouveau ${entity.singular}`
    : (typeof titleValue === "string" ? titleValue : (titleValue as { fr?: string } | undefined)?.fr) || `Modifier le ${entity.singular}`;

  return (
    <>
      <Link href={`/admin/${entity.segment}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" />
        {entity.plural}
      </Link>
      <PageTitle
        title={title}
        actions={!isNew && <DeleteButton action={deleteEntity.bind(null, entity.key, id)} label={`Supprimer ce ${entity.singular}`} />}
      />
      <EntityForm
        fields={entity.fields}
        initial={initial}
        action={saveEntity.bind(null, entity.key, isNew ? null : id)}
        media={media}
        categories={categories}
        cancelHref={`/admin/${entity.segment}`}
      />
    </>
  );
}

// Admin pages read the session and live data on every request; they are not
// meant to be instant (prerendered) navigations, so skip that validation.
export const instant = false;
