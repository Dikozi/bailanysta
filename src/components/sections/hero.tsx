import { ArrowDown, Check } from "lucide-react";
import { site } from "@/lib/site";
import { HeroDemo } from "../demo/hero-demo";
import { Container, GhostLink, TelegramButton } from "../ui";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Мягкий свет за демо */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-240px] right-[-160px] h-[720px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgb(47_125_225/0.22),transparent)]"
      />
      <Container className="relative grid items-center gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:gap-14 lg:pt-24 lg:pb-28">
        <div className="max-w-xl">
          <h1 id="hero-title" className="display text-fg text-[clamp(2.6rem,7vw,3.7rem)]">
            Одно голосовое&nbsp;—{" "}
            <span className="text-fg-2">и&nbsp;день разложен по&nbsp;полочкам.</span>
          </h1>
          <p className="text-fg-2 mt-6 text-[17px] leading-relaxed sm:text-[19px]">
            Личный ассистент в твоём Telegram. Настроим под тебя — и он будет записывать дела,
            ставить их в Google Календарь и напоминать вовремя.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TelegramButton />
            <GhostLink href="#day">
              Как это работает
              <ArrowDown className="size-4" aria-hidden />
            </GhostLink>
          </div>
          <ul className="text-fg-2 mt-8 flex flex-col gap-2.5 text-[15px]">
            {[
              "Без новых приложений — всё в Telegram",
              `Настроим под твой ритм за ${site.price.setupDays} дня`,
              `Разово ${site.price.total} — без абонентки`,
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="bg-sky/15 grid size-5 shrink-0 place-items-center rounded-full">
                  <Check className="text-sky size-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="tabular">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <HeroDemo />
      </Container>
    </section>
  );
}
