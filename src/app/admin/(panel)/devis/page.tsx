import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { Badge, EmptyState, ORG_LABELS, PageTitle, QUOTE_STATUS, SOLUTION_LABELS, SavedNotice, formatDate } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Demandes de devis" };

type QuoteRow = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  phone: string;
  org_type: string | null;
  solutions: string[];
  status: string;
  quote_items: { count: number }[];
};

export default async function QuotesPage({ searchParams }: PageProps<"/admin/devis">) {
  const query = await searchParams;
  const status = typeof query.statut === "string" && query.statut in QUOTE_STATUS ? query.statut : "";
  const { supabase } = await requireAdmin();

  let request = supabase
    .from("quote_requests")
    .select("id, created_at, name, company, phone, org_type, solutions, status, quote_items(count)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as QuoteRow[];

  const filters = [{ value: "", label: "Toutes" }, ...Object.entries(QUOTE_STATUS).map(([value, { label }]) => ({ value, label }))];

  return (
    <>
      <PageTitle
        title="Demandes de devis"
        intro="Chaque demande envoyée depuis le site. Mettez à jour le statut au fil du suivi commercial."
        actions={
          <a href="/admin/devis/export" download className="btn border border-line bg-white text-ink hover:border-ink/30">
            <Download className="size-4" />
            Exporter (CSV)
          </a>
        }
      />
      <SavedNotice params={query} />

      <nav aria-label="Filtrer par statut" className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value ? `/admin/devis?statut=${filter.value}` : "/admin/devis"}
            aria-current={status === filter.value ? "page" : undefined}
            className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-3.5 text-sm font-medium text-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState>Aucune demande {status ? "avec ce statut" : "pour le moment"}.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
          {rows.map((row) => {
            const itemCount = row.quote_items?.[0]?.count ?? 0;
            const badge = QUOTE_STATUS[row.status] ?? QUOTE_STATUS.new;
            return (
              <li key={row.id}>
                <Link href={`/admin/devis/${row.id}`} className="grid gap-1 px-4 py-3.5 transition-colors hover:bg-mist sm:grid-cols-[1fr_auto] sm:items-center sm:px-5">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{row.name}</span>
                      {row.company && <span className="text-sm">· {row.company}</span>}
                    </span>
                    <span className="mt-0.5 block text-sm">
                      {[row.org_type ? ORG_LABELS[row.org_type] : null, row.solutions.map((s) => SOLUTION_LABELS[s] ?? s).join(", "), itemCount ? `${itemCount} équipement(s)` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm sm:justify-end">
                    <span className="tabular-nums">{formatDate(row.created_at)}</span>
                    <Badge label={badge.label} tone={badge.tone} />
                  </span>
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
