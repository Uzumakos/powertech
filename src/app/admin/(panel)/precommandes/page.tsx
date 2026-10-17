import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePreorder, updatePreorderStatus } from "@/lib/admin/actions";
import { telHref, whatsappHref } from "@/lib/contact";
import { DeleteButton } from "@/components/admin/delete-button";
import { inputClass } from "@/components/admin/fields";
import { Badge, CONTACT_LABELS, EmptyState, PREORDER_STATUS, PageTitle, SavedNotice, formatDate } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Précommandes" };

type PreorderRow = {
  id: string;
  created_at: string;
  product_label: string;
  quantity: number;
  desired_date: string | null;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  contact_pref: string;
  message: string | null;
  status: string;
};

export default async function PreordersPage({ searchParams }: PageProps<"/admin/precommandes">) {
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("preorders").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as PreorderRow[];

  // Demand per product, excluding cancelled and delivered reservations: the
  // number to look at before validating an import order.
  const demand = new Map<string, { units: number; requests: number }>();
  for (const row of rows) {
    if (row.status === "cancelled" || row.status === "fulfilled") continue;
    const entry = demand.get(row.product_label) ?? { units: 0, requests: 0 };
    entry.units += row.quantity;
    entry.requests += 1;
    demand.set(row.product_label, entry);
  }
  const demandRows = [...demand.entries()].sort((a, b) => b[1].units - a[1].units);

  return (
    <>
      <PageTitle
        title="Précommandes"
        intro="Réservations fermes faites depuis le site sur les produits en arrivage. La demande cumulée aide à dimensionner les commandes d'importation."
      />
      <SavedNotice params={query} />

      {demandRows.length > 0 && (
        <section className="mb-8 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7">
          <h2 className="font-bold text-ink">Demande en cours par produit</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {demandRows.map(([product, { units, requests }]) => (
              <li key={product} className="rounded-[var(--radius-field)] border border-line bg-mist p-4">
                <p className="font-semibold leading-snug text-ink">{product}</p>
                <p className="wide mt-2 text-3xl font-extrabold tabular-nums text-crimson">{units}</p>
                <p className="text-sm">
                  unité(s) · {requests} demande(s)
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rows.length === 0 ? (
        <EmptyState>Aucune précommande pour le moment. Activez « Précommande ouverte » sur un produit pour recevoir des réservations.</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) => {
            const badge = PREORDER_STATUS[row.status] ?? PREORDER_STATUS.new;
            return (
              <li key={row.id} className="rounded-[var(--radius-card)] border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {row.quantity} × {row.product_label}
                    </p>
                    <p className="mt-1 text-sm">
                      {row.name}
                      {row.company ? ` · ${row.company}` : ""} · {formatDate(row.created_at)}
                      {row.desired_date ? ` · souhaité pour le ${new Date(row.desired_date).toLocaleDateString("fr-FR")}` : ""}
                    </p>
                  </div>
                  <Badge label={badge.label} tone={badge.tone} />
                </div>
                {row.message && <p className="mt-3 whitespace-pre-line rounded-[var(--radius-field)] bg-mist p-3 text-[0.9375rem] text-ink">{row.message}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={telHref(row.phone)} className="btn min-h-10 border border-line bg-mist text-sm text-ink">
                    <Phone className="size-4 text-crimson" />
                    {row.phone}
                  </a>
                  <a href={whatsappHref(row.phone)} target="_blank" rel="noopener noreferrer" className="btn min-h-10 border border-line bg-mist text-sm text-ink">
                    <MessageCircle className="size-4 text-crimson" />
                    WhatsApp
                  </a>
                  {row.email && (
                    <a href={`mailto:${row.email}`} className="btn min-h-10 border border-line bg-mist text-sm text-ink">
                      <Mail className="size-4 text-crimson" />
                      {row.email}
                    </a>
                  )}
                  <span className="text-sm">Préfère : {CONTACT_LABELS[row.contact_pref] ?? row.contact_pref}</span>
                  <form action={updatePreorderStatus.bind(null, row.id)} className="ml-auto flex items-center gap-2">
                    <label htmlFor={`status-${row.id}`} className="sr-only">
                      Statut
                    </label>
                    <select id={`status-${row.id}`} name="status" defaultValue={row.status} className={`${inputClass} w-auto py-2`}>
                      {Object.entries(PREORDER_STATUS).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn min-h-10 btn-volt text-sm">
                      Mettre à jour
                    </button>
                  </form>
                  <DeleteButton action={deletePreorder.bind(null, row.id)} label="Supprimer" />
                </div>
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
