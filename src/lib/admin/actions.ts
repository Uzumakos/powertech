"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import fr from "@/i18n/dictionaries/fr";
import en from "@/i18n/dictionaries/en";
import { diffDeep } from "@/i18n/merge";
import { getSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";
import { entities, settingsFields, type EntityKey } from "./entities";
import { parseFields, type FormErrors } from "./parse";

export type FormState = {
  errors?: FormErrors;
  message?: string;
  saved?: boolean;
  /** What was submitted, so the form can redisplay it after an error. */
  values?: Record<string, unknown>;
  /** Changes on every response; the form uses it to remount with `values`. */
  at?: number;
};

const QUOTE_STATUSES = ["new", "in_progress", "quoted", "won", "lost"];
const PREORDER_STATUSES = ["new", "confirmed", "ordered", "fulfilled", "cancelled"];

function refresh(tags: string[]) {
  for (const tag of tags) updateTag(tag);
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) redirect("/admin/configuration");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { message: "Entrez votre e-mail et votre mot de passe." };

  const supabase = await getSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: "E-mail ou mot de passe incorrect." };
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await getSessionClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Content types (products, categories, services, projects, partners, media)
// ---------------------------------------------------------------------------

export async function saveEntity(key: EntityKey, id: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const entity = entities[key];
  const { values, errors } = parseFields(entity.fields, formData);
  if (Object.keys(errors).length > 0) return { errors, values, at: Date.now(), message: "Corrigez les champs signalés." };

  const query = id ? supabase.from(entity.table).update(values).eq("id", id) : supabase.from(entity.table).insert(values);
  const { error } = await query;
  if (error) {
    if (error.code === "23505") return { errors: { slug: "Cette adresse est déjà utilisée par un autre élément." }, values, at: Date.now(), message: "Corrigez les champs signalés." };
    console.error(`save ${entity.table} failed`, error);
    return { message: `L'enregistrement a échoué : ${error.message}`, values, at: Date.now() };
  }

  refresh(entity.tags);
  redirect(`/admin/${entity.segment}?enregistre=1`);
}

export async function deleteEntity(key: EntityKey, id: string) {
  const { supabase } = await requireAdmin();
  const entity = entities[key];
  const { error } = await supabase.from(entity.table).delete().eq("id", id);
  if (error) throw new Error(`Suppression impossible : ${error.message}`);
  refresh(entity.tags);
  redirect(`/admin/${entity.segment}?supprime=1`);
}

// ---------------------------------------------------------------------------
// Settings and site texts
// ---------------------------------------------------------------------------

export async function saveSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const { values, errors } = parseFields(settingsFields, formData);
  if (Object.keys(errors).length > 0) return { errors, values, at: Date.now(), message: "Corrigez les champs signalés." };

  const { error } = await supabase.from("settings").upsert({ id: 1, ...values });
  if (error) return { message: `L'enregistrement a échoué : ${error.message}`, values, at: Date.now() };
  refresh(["settings"]);
  return { saved: true, values, at: Date.now(), message: "Paramètres enregistrés. Le site est à jour." };
}

/** Stores only what differs from the built-in text, per language. */
export async function saveTexts(edited: { fr: unknown; en: unknown }): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const rows = [
    { locale: "fr", content: diffDeep(fr, edited.fr) ?? {} },
    { locale: "en", content: diffDeep(en, edited.en) ?? {} },
  ];
  const { error } = await supabase.from("site_content").upsert(rows);
  if (error) return { message: `L'enregistrement a échoué : ${error.message}` };
  refresh(["texts"]);
  return { saved: true, message: "Textes enregistrés. Le site est à jour." };
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function updateQuoteStatus(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status"));
  if (!QUOTE_STATUSES.includes(status)) return;
  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  redirect(`/admin/devis/${id}?enregistre=1`);
}

export async function deleteQuote(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("quote_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin/devis?supprime=1");
}

export async function updatePreorderStatus(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status"));
  if (!PREORDER_STATUSES.includes(status)) return;
  const { error } = await supabase.from("preorders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin/precommandes?enregistre=1");
}

export async function deletePreorder(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("preorders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin/precommandes?supprime=1");
}
