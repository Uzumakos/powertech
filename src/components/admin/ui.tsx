import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export function PageTitle({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="wide text-[1.75rem] font-bold leading-tight tracking-[-0.02em] sm:text-3xl">{title}</h1>
        {intro && <p className="mt-2 max-w-[70ch] leading-relaxed">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Confirmation after a redirect (?enregistre=1, ?supprime=1). */
export function SavedNotice({ params }: { params: Record<string, string | string[] | undefined> }) {
  const message = params.enregistre ? "Modifications enregistrées. Le site est à jour." : params.supprime ? "Élément supprimé." : null;
  if (!message) return null;
  return (
    <p role="status" className="mb-6 flex items-center gap-2.5 rounded-[var(--radius-field)] border border-[#16a34a]/30 bg-[#16a34a]/[0.06] p-3.5 text-[0.9375rem] text-[#166534]">
      <CheckCircle2 className="size-5 shrink-0" />
      {message}
    </p>
  );
}

export const QUOTE_STATUS: Record<string, { label: string; tone: string }> = {
  new: { label: "Nouvelle", tone: "bg-crimson text-white" },
  in_progress: { label: "En cours", tone: "bg-volt text-ink" },
  quoted: { label: "Devis envoyé", tone: "bg-[#dbeafe] text-[#1e3a8a]" },
  won: { label: "Gagnée", tone: "bg-[#dcfce7] text-[#166534]" },
  lost: { label: "Perdue", tone: "bg-line text-muted" },
};

export const PREORDER_STATUS: Record<string, { label: string; tone: string }> = {
  new: { label: "Nouvelle", tone: "bg-crimson text-white" },
  confirmed: { label: "Confirmée", tone: "bg-volt text-ink" },
  ordered: { label: "Commandée", tone: "bg-[#dbeafe] text-[#1e3a8a]" },
  fulfilled: { label: "Livrée", tone: "bg-[#dcfce7] text-[#166534]" },
  cancelled: { label: "Annulée", tone: "bg-line text-muted" },
};

export const ORG_LABELS: Record<string, string> = {
  institution: "Banque / institution",
  business: "Commerce / entreprise",
  residential: "Résidentiel",
};

export const SOLUTION_LABELS: Record<string, string> = {
  solar: "Solaire",
  ups: "UPS",
  generator: "Générateur",
  service: "Contrat SAV",
};

export const CONTACT_LABELS: Record<string, string> = {
  call: "Appel",
  whatsapp: "WhatsApp",
  email: "E-mail",
};

export function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Port-au-Prince" }).format(
    new Date(value),
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-14 text-center text-[0.9375rem]">
      {children}
    </div>
  );
}
