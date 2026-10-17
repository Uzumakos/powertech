/* eslint-disable @next/next/no-img-element -- admin thumbnails of links from any host */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { entityBySegment, STOCK_STATUSES } from "@/lib/admin/entities";
import { Badge, EmptyState, PageTitle, SavedNotice } from "@/components/admin/ui";

const statusLabels: Record<string, string> = {
  ...Object.fromEntries(STOCK_STATUSES.map((status) => [status.value, status.label])),
  client: "Client",
  brand: "Marque",
  photo: "Photo",
  logo: "Logo",
  partner: "Logo partenaire",
  document: "Document",
};

type Row = Record<string, unknown> & { id: string };

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "fr" in value) return String((value as { fr: string }).fr);
  return "";
}

export async function generateMetadata({ params }: PageProps<"/admin/[entity]">): Promise<Metadata> {
  const { entity: segment } = await params;
  return { title: entityBySegment(segment)?.plural };
}

export default async function EntityListPage({ params, searchParams }: PageProps<"/admin/[entity]">) {
  const [{ entity: segment }, query] = await Promise.all([params, searchParams]);
  const entity = entityBySegment(segment);
  if (!entity) notFound();

  const { supabase } = await requireAdmin();
  let request = supabase.from(entity.table).select("*");
  // Newest first for dated lists, otherwise the display order.
  for (const column of entity.order) request = request.order(column, { ascending: column !== "created_at" });
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageTitle
        title={entity.plural}
        intro={entity.intro}
        actions={
          <Link href={`/admin/${entity.segment}/nouveau`} className="btn btn-volt">
            <Plus className="size-4" />
            Ajouter
          </Link>
        }
      />
      <SavedNotice params={query} />

      {rows.length === 0 ? (
        <EmptyState>
          Aucun élément pour le moment.{" "}
          <Link href={`/admin/${entity.segment}/nouveau`} className="font-semibold text-crimson underline">
            Ajouter le premier
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
          {rows.map((row) => {
            const imageValue = entity.imageField ? row[entity.imageField] : null;
            const image = Array.isArray(imageValue) ? imageValue[0] : (imageValue as string | null);
            const status = entity.statusField ? String(row[entity.statusField] ?? "") : "";
            const hidden = row.active === false;
            return (
              <li key={row.id}>
                <Link
                  href={`/admin/${entity.segment}/${row.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-mist sm:px-5"
                >
                  <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-mist">
                    {image ? <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">
                      {text(row[entity.titleField]) || text(row.url) || "Sans titre"}
                    </span>
                    {typeof row.slug === "string" && <span className="block truncate text-sm">/{row.slug}</span>}
                  </span>
                  {status && <Badge label={statusLabels[status] ?? status} tone="bg-mist text-ink border border-line" />}
                  {hidden && <Badge label="Masqué" tone="bg-line text-muted" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// Admin pages read the session and live data on every request; they are not
// meant to be instant (prerendered) navigations, so skip that validation.
export const instant = false;
