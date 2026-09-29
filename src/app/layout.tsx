import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import "./globals.css";

const description =
  "Личный ИИ-ассистент в Telegram: записывает дела из текста и голоса, ставит их в Google Календарь, напоминает и подводит итоги. Настройка под ключ.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "My Assist — личный ИИ-ассистент в Telegram",
  description,
  openGraph: {
    title: "My Assist — личный ИИ-ассистент в Telegram",
    description,
    locale: "ru_RU",
    type: "website",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#04060d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
