import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Validation and limits shared by the quote and pre-order actions.

export const CONTACT_PREFS = ["call", "whatsapp", "email"] as const;
export type ContactPref = (typeof CONTACT_PREFS)[number];

export const text = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

export const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  (list as readonly string[]).includes(value);

export const isValidPhone = (phone: string) => /^[+()\d\s.-]+$/.test(phone) && phone.replace(/\D/g, "").length >= 8;
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** At most 3 submissions per phone number in 10 minutes, per table. */
export async function isRateLimited(supabase: SupabaseClient, table: "quote_requests" | "preorders", phone: string): Promise<boolean> {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("phone", phone).gte("created_at", since);
  return (count ?? 0) >= 3;
}
