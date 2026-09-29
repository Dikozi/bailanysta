import { site } from "@/lib/site";
import { TelegramIcon, Wordmark } from "../brand";
import { Container } from "../ui";

const NAV = [
  { href: "#day", label: "Как это работает" },
  { href: "#features", label: "Возможности" },
  { href: "#price", label: "Цена" },
  { href: "#faq", label: "Вопросы" },
];

export function Header() {
  return (
    <header className="border-line bg-ink-950/80 sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex h-16 items-center gap-8">
        <a href="#top" aria-label="My Assist — наверх" className="rounded-md">
          <Wordmark />
        </a>
        <nav aria-label="Разделы" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-fg-2 hover:text-fg text-[14px] transition-colors duration-150"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={site.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fg ring-line-strong ml-auto inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[14px] font-medium ring-1 transition-colors duration-200 hover:bg-white/[0.1]"
        >
          <TelegramIcon className="text-sky size-4" />
          Написать
        </a>
      </Container>
    </header>
  );
}
