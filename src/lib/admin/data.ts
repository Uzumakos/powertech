import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaOption } from "@/components/admin/fields";

/** Media library entries for the image pickers. */
export async function getMediaOptions(supabase: SupabaseClient): Promise<MediaOption[]> {
  const { data } = await supabase.from("media").select("url, alt, kind").order("created_at", { ascending: false });
  return (data ?? [])
    .filter((item) => item.kind !== "document")
    .map((item) => ({
      url: item.url,
      label: item.alt?.fr || decodeURIComponent(item.url.split("/").pop()?.split("?")[0] ?? item.url),
    }));
}

export async function getCategoryOptions(supabase: SupabaseClient) {
  const { data } = await supabase.from("categories").select("id, name").order("sort_order");
  return (data ?? []).map((item) => ({ value: item.id as string, label: (item.name?.fr as string) ?? "" }));
}
