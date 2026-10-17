import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only client for public content (row-level security limits it to
 * published rows). Returns null while Supabase isn't configured, so the site
 * runs on seed data during setup.
 */
export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
