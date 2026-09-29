import { site } from "@/lib/site";
import { InstagramIcon, TelegramIcon, Wordmark } from "../brand";
import { Container, TelegramButton } from "../ui";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="border-line relative overflow-hidden border-t">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-360px] left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(47_125_225/0.2),transparent)]"
      />
      <Container className="relative flex flex-col items-center py-28 text-center sm:py-36">
        <h2 id="cta-title" className="display text-fg max-w-3xl text-[clamp(2.2rem,5vw,3.75rem)]">
          Расскажи, как проходит твой день
        </h2>
        <p className="text-fg-2 mt-5 max-w-xl text-[17px] leading-relaxed sm:text-lg">
          Напиши в Telegram — обсудим, что ассистент должен взять на себя, и настроим его под тебя.
        </p>
        <TelegramButton size="lg" className="mt-9" />
        <p className="tabular text-fg-3 mt-4 font-mono text-[13px]">{site.telegram.handle}</p>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-line border-t">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Wordmark />
          <p className="text-fg-3 max-w-md text-[13px] leading-relaxed">
            Переписки на странице — демонстрация работы бота, а не данные клиентов. © 2026 My Assist
          </p>
        </div>
        <ul className="flex items-center gap-2">
          <li>
            <a
              href={site.telegram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="text-fg-2 ring-line hover:text-fg hover:ring-line-strong grid size-10 place-items-center rounded-full ring-1 transition-colors duration-150"
            >
              <TelegramIcon className="size-[18px]" />
            </a>
          </li>
          <li>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-fg-2 ring-line hover:text-fg hover:ring-line-strong grid size-10 place-items-center rounded-full ring-1 transition-colors duration-150"
            >
              <InstagramIcon className="size-[18px]" />
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  );
}
