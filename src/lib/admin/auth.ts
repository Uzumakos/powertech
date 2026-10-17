import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type AdminSession = { supabase: SupabaseClient; user: User };

/**
 * The data access gate for the admin: resolves the signed-in user, checks the
 * admins table and redirects to the login page otherwise. Every admin page and
 * every admin Server Action calls it; RLS enforces the same rule in the database.
 */
export async function requireAdmin(): Promise<AdminSession> {
  // Always decide at request time, never at build time (where env vars or a
  // session may be missing and a redirect would be baked into the page).
  await connection();
  if (!isSupabaseConfigured()) redirect("/admin/configuration");

  const supabase = await getSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?erreur=acces");

  return { supabase, user };
}
