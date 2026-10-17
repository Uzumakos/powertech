import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, offline fallback and pre-order forms have nothing to index.
      disallow: ["/admin", "/fr/hors-ligne", "/en/hors-ligne", "/fr/precommande/", "/en/precommande/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
