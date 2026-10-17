import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteQuote, updateQuoteStatus } from "@/lib/admin/actions";
import { telHref, whatsappHref } from "@/lib/contact";
import { DeleteButton } from "@/components/admin/delete-button";
import { inputClass } from "@/components/admin/fields";
import {
  Badge,
  CONTACT_LABELS,
  ORG_LABELS,
  PageTitle,
  QUOTE_STATUS,
  SOLUTION_LABELS,
  SavedNotice,
  formatDate,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Demande de devis" };

export default async function QuoteDetailPage({ params, searchParams }: PageProps<"/admin/devis/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { data: quote } = await supabase
    .from("quote_requests")
    .select("*, quote_items(id, label, quantity, notes, product:products(slug))")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();

  const badge = QUOTE_STATUS[quote.status] ?? QUOTE_STATUS.new;
  const details: [string, string | null][] = [
    ["Reçue le", formatDate(quote.created_at)],
    ["Organisation", quote.org_type ? ORG_LABELS[quote.org_type] : null],
    ["Entreprise", quote.company],
    ["Téléphone", quote.phone],
    ["E-mail", quote.email],
    ["Ville", quote.city],
    ["Préfère être contacté par", CONTACT_LABELS[quote.contact_pref] ?? quote.contact_pref],
    ["Langue du site", quote.locale === "en" ? "Anglais" : "Français"],
    ["Solutions", (quote.solutions as string[]).map((s) => SOLUTION_LABELS[s] ?? s).join(", ") || null],
  ];

  return (
    <>
      <Link href="/admin/devis" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" />
        Demandes de devis
      </Link>
      <PageTitle
        title={quote.name}
        actions={<DeleteButton action={deleteQuote.bind(null, id)} label="Supprimer" />}
      />
      <SavedNotice params={query} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="grid gap-6">
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7">
            <h2 className="font-bold text-ink">Coordonnées et besoin</h2>
            <dl className="mt-4 divide-y divide-line">
              {details
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[13rem_1fr]">
                    <dt className="text-sm">{label}</dt>
                    <dd className="font-medium text-ink">{value}</dd>
                  </div>
                ))}
            </dl>
            {quote.message && (
              <div className="mt-5 rounded-[var(--radius-field)] bg-mist p-4">
                <p className="text-sm font-semibold text-ink">Message</p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-ink">{quote.message}</p>
              </div>
            )}
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7">
            <h2 className="font-bold text-ink">Équipements demandés</h2>
            {quote.quote_items.length === 0 ? (
              <p className="mt-3 text-[0.9375rem]">Aucun équipement précis : la demande porte sur les solutions cochées.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {quote.quote_items.map((item: { id: string; label: string; quantity: number; product: { slug: string } | null }) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-2.5">
                    {item.product ? (
                      <a href={`/fr/produits/${item.product.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-crimson hover:underline">
                        {item.label}
                      </a>
                    ) : (
                      <span className="font-medium text-ink">{item.label}</span>
                    )}
                    <span className="font-semibold tabular-nums text-ink">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ink">Statut</h2>
              <Badge label={badge.label} tone={badge.tone} />
            </div>
            <form action={updateQuoteStatus.bind(null, id)} className="mt-4 grid gap-2">
              <label htmlFor="quote-status" className="sr-only">
                Nouveau statut
              </label>
              <select id="quote-status" name="status" defaultValue={quote.status} className={inputClass}>
                {Object.entries(QUOTE_STATUS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-volt">
                Mettre à jour
              </button>
            </form>
          </section>
          <section className="grid gap-2 rounded-[var(--radius-card)] border border-line bg-white p-5">
            <h2 className="mb-1 font-bold text-ink">Recontacter</h2>
            <a href={telHref(quote.phone)} className="btn justify-start border border-line bg-mist text-ink">
              <Phone className="size-4 text-crimson" />
              {quote.phone}
            </a>
            <a href={whatsappHref(quote.phone)} target="_blank" rel="noopener noreferrer" className="btn justify-start border border-line bg-mist text-ink">
              <MessageCircle className="size-4 text-crimson" />
              WhatsApp
            </a>
            {quote.email && (
              <a href={`mailto:${quote.email}`} className="btn justify-start border border-line bg-mist text-ink">
                <Mail className="size-4 text-crimson" />
                {quote.email}
              </a>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

// Admin pages read the session and live data on every request; they are not
// meant to be instant (prerendered) navigations, so skip that validation.
export const instant = false;
