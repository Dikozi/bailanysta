import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Только статические верхнеуровневые маршруты.
 *
 * Профили, посты и теги меняются постоянно и не несут ценности для индексации
 * поодиночке — это лента с пользовательским контентом, а не документация.
 * Перечислять каждый пост отдельным URL означало бы городить обход всей базы
 * ради строк, которые ничего не выигрывают от присутствия в sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "always", priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
