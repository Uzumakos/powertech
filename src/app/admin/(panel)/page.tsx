import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Boxes, ClipboardList, PackageCheck, Type } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { Badge, EmptyState, PageTitle, QUOTE_STATUS, formatDate } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const count = (table: string, filter?: [string, string]) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = query.eq(filter[0], filter[1]);
    return query.then(({ count: total }) => total ?? 0);
  };

  const [newQuotes, totalQuotes, newPreorders, products, recent] = await Promise.all([
    count("quote_requests", ["status", "new"]),
    count("quote_requests"),
    count("preorders", ["status", "new"]),
    count("products", ["active", "true"]),
    supabase
      .from("quote_requests")
      .select("id, created_at, name, company, status")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => data ?? []),
  ]);

  const stats = [
    { label: "Nouvelles demandes de devis", value: newQuotes, href: "/admin/devis?statut=new", icon: ClipboardList, highlight: newQuotes > 0 },
    { label: "Demandes de devis au total", value: totalQuotes, href: "/admin/devis", icon: ClipboardList },
    { label: "Nouvelles précommandes", value: newPreorders, href: "/admin/precommandes", icon: PackageCheck, highlight: newPreorders > 0 },
    { label: "Produits en ligne", value: products, href: "/admin/produits", icon: Boxes },
  ];

  return (
    <>
      <PageTitle title="Tableau de bord" intro="Les demandes arrivées depuis le site et l'état du catalogue." />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon, highlight }) => (
          <li key={label}>
            <Link
              href={href}
              className={`group flex h-full flex-col rounded-[var(--radius-card)] border p-5 transition-colors ${
                highlight ? "border-crimson/40 bg-crimson/[0.04] hover:border-crimson" : "border-line bg-white hover:border-ink/30"
              }`}
            >
              <span className="flex items-center justify-between">
                <Icon className={`size-5 ${highlight ? "text-crimson" : "text-muted"}`} />
                <ArrowUpRight className="size-4 text-muted group-hover:text-ink" />
              </span>
              <span className="wide mt-4 text-4xl font-extrabold tabular-nums text-ink">{value}</span>
              <span className="mt-1 text-sm">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink">Dernières demandes</h2>
            <Link href="/admin/devis" className="text-sm font-semibold text-crimson hover:underline">
              Tout voir
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-4">
              <EmptyState>Les demandes envoyées depuis le site apparaîtront ici.</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((quote) => {
                const badge = QUOTE_STATUS[quote.status] ?? QUOTE_STATUS.new;
                return (
                  <li key={quote.id}>
                    <Link href={`/admin/devis/${quote.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-ink">
                      <span>
                        <span className="font-semibold text-ink">{quote.name}</span>
                        {quote.company && <span className="text-sm"> · {quote.company}</span>}
                      </span>
                      <span className="flex items-center gap-3 text-sm">
                        <span className="tabular-nums">{formatDate(quote.created_at)}</span>
                        <Badge label={badge.label} tone={badge.tone} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="grid content-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7">
          <h2 className="font-bold text-ink">Raccourcis</h2>
          {[
            { href: "/admin/produits/nouveau", label: "Ajouter un produit", icon: Boxes },
            { href: "/admin/textes", label: "Modifier les textes du site", icon: Type },
            { href: "/admin/medias/nouveau", label: "Ajouter une image à la médiathèque", icon: ArrowUpRight },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-[var(--radius-field)] border border-line bg-mist px-4 py-3 text-[0.9375rem] font-medium text-ink hover:border-ink/30">
              <Icon className="size-4 text-crimson" />
              {label}
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}

// Admin pages read the session and live data on every request; they are not
// meant to be instant (prerendered) navigations, so skip that validation.
export const instant = false;
