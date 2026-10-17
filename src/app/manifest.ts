import type { MetadataRoute } from "next";
import { getDictionaryFor } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/data";

/** Web app manifest: makes the site installable. Name and texts come from the admin. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [settings, dict] = await Promise.all([getSettings(), getDictionaryFor("fr")]);

  return {
    id: "/",
    name: settings.companyName,
    short_name: dict.pwa.appName,
    description: dict.meta.description,
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#0b0f19",
    categories: ["business", "shopping", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: dict.catalog.title, url: "/fr/produits", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: dict.devis.title, url: "/fr/devis", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: dict.nav.contact, url: "/fr/contact", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
