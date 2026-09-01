import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import { AppProviders } from "@/providers/AppProviders";
import { getCurrentUser } from "@/server/auth/session";
import { COOKIE_THEME } from "@/lib/constants";
import { isTheme, type Theme } from "@/lib/theme";
import "./globals.css";

/**
 * Шрифты подключены через next/font: файлы самохостятся при сборке,
 * поэтому нет запроса к стороннему CDN и нет скачка вёрстки при загрузке.
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "Bailanysta — социальная сеть: лента постов, профили, подписки, лайки и комментарии.";

export const metadata: Metadata = {
  // Без metadataBase относительные пути в Open Graph остаются относительными,
  // а мессенджеры требуют абсолютный URL картинки — превью просто не появится.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bailanysta — социальная сеть",
    template: "%s · Bailanysta",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Bailanysta",
    title: "Bailanysta — социальная сеть",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Bailanysta — социальная сеть",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const cookieTheme = store.get(COOKIE_THEME)?.value;
  const theme: Theme = isTheme(cookieTheme) ? cookieTheme : "system";

  // Профиль читаем на сервере: интерфейс отрисовывается сразу залогиненным,
  // без секундного мелькания кнопки «Войти».
  const user = await getCurrentUser();

  return (
    <html
      lang="ru"
      // Тема попадает в HTML ещё на сервере — поэтому страница не мигает
      // светлым фоном перед тем, как применится выбор пользователя.
      // "system" атрибут не ставит: тогда работает prefers-color-scheme.
      data-theme={theme === "system" ? undefined : theme}
      className={`${manrope.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders initialUser={user} initialTheme={theme}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
