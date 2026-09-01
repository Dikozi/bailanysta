import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Закрываем от индексации только служебные и приватные разделы —
 * настройки и уведомления не несут смысла вне контекста своего аккаунта
 * и не должны занимать место в выдаче поисковика.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/settings", "/notifications"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
