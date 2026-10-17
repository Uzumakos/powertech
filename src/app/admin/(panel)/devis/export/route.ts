import { NextResponse } from "next/server";
import { getSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CONTACT_LABELS, ORG_LABELS, QUOTE_STATUS, SOLUTION_LABELS, formatDate } from "@/components/admin/ui";

const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : Array.isArray(value) ? value.join(" | ") : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** All quote requests with their items, as CSV for Excel. Admins only (RLS). */
export async function GET() {
  if (!isSupabaseConfigured()) return new NextResponse("Supabase non configuré", { status: 503 });
  const supabase = await getSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Non autorisé", { status: 401 });

  const { data, error } = await supabase
    .from("quote_requests")
    .select("created_at, status, name, company, phone, email, city, org_type, solutions, contact_pref, message, quote_items(label, quantity)")
    .order("created_at", { ascending: false });
  if (error) return new NextResponse(error.message, { status: 500 });

  const header = ["Date", "Statut", "Nom", "Entreprise", "Téléphone", "E-mail", "Ville", "Organisation", "Solutions", "Contact préféré", "Équipements", "Message"];
  const lines = (data ?? []).map((row) =>
    [
      formatDate(row.created_at),
      QUOTE_STATUS[row.status]?.label ?? row.status,
      row.name,
      row.company,
      row.phone,
      row.email,
      row.city,
      row.org_type ? ORG_LABELS[row.org_type] ?? row.org_type : null,
      (row.solutions as string[]).map((solution) => SOLUTION_LABELS[solution] ?? solution),
      CONTACT_LABELS[row.contact_pref] ?? row.contact_pref,
      (row.quote_items as { label: string; quantity: number }[]).map((item) => `${item.quantity} × ${item.label}`),
      row.message,
    ]
      .map(csvCell)
      .join(","),
  );
  // BOM so Excel opens accents correctly.
  const body = "﻿" + [header.join(","), ...lines].join("\r\n");
  // Today's date in Haiti (sv-SE formats as YYYY-MM-DD).
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Port-au-Prince" }).format(new Date());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-devis-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
