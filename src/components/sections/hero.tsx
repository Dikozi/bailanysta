import { ArrowDown } from "lucide-react";
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
            Меньше держать в&nbsp;голове. <span className="text-fg-2">Больше успевать.</span>
          </h1>
          <p className="text-fg-2 mt-6 text-[17px] leading-relaxed sm:text-[19px]">
            Личный ИИ-ассистент в Telegram. Пишешь или говоришь дела как есть — он раскладывает их
            на задачи, ставит в Google Календарь и напоминает вовремя.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TelegramButton />
            <GhostLink href="#day">
              Как это работает
              <ArrowDown className="size-4" aria-hidden />
            </GhostLink>
          </div>
          <p className="text-fg-3 mt-6 text-[14px]">
            Настраиваем под тебя за{" "}
            <span className="tabular text-fg-2 font-medium">{site.price.total}</span> · неделя
            поддержки включена
          </p>
        </div>

        <HeroDemo />
      </Container>
    </section>
  );
}
