import { Check } from "lucide-react";
import { site } from "@/lib/site";
import { Container, SectionHeading, TelegramButton } from "../ui";

const INCLUDED = [
  "Свой Telegram-бот с ассистентом",
  "Подключение Google Календаря, Таблицы и Диска",
  "Время утреннего плана, вечерней сверки и часовой пояс — под твой ритм",
  `${site.price.supportDays} дней поддержки и доработок после запуска`,
];

const STEPS = [
  {
    title: "Пишешь в Telegram",
    text: "Расскажи, как проходит твой день и где теряются дела.",
  },
  {
    title: `Предоплата ${site.price.prepay}`,
    text: "Фиксируем договорённость и начинаем настройку.",
  },
  {
    title: "Настраиваем ассистента",
    text: "Подключаем бота к Google и подстраиваем под твоё расписание.",
  },
  {
    title: "Неделя поддержки",
    text: "Пользуешься, а мы донастраиваем по ходу. Дальше доработки — отдельно.",
  },
];

export function Pricing() {
  return (
    <section
      id="price"
      aria-labelledby="price-title"
      className="border-line border-t py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          id="price-title"
          title="Одна цена. Настраиваем под тебя."
          lead="Это не подписка на приложение, а личная установка: мы собираем ассистента под твой ритм и остаёмся рядом первую неделю."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <div className="border-sky/25 bg-ink-900 relative overflow-hidden rounded-3xl border p-7 sm:p-9 lg:col-span-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-40 -right-40 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(47_125_225/0.18),transparent)]"
            />
            <p className="tabular display text-fg relative text-[clamp(3rem,7vw,4.5rem)]">
              {site.price.total}
            </p>
            <p className="text-fg-2 relative mt-2 text-[15px]">
              Личный ассистент под ключ · предоплата{" "}
              <span className="tabular text-fg font-medium">{site.price.prepay}</span>
            </p>

            <ul className="border-line relative mt-8 flex flex-col gap-3.5 border-t pt-8">
              {INCLUDED.map((item) => (
                <li key={item} className="text-fg flex gap-3 text-[15.5px] leading-snug">
                  <span className="bg-sky/15 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                    <Check className="text-sky size-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <TelegramButton size="lg">Обсудить настройку</TelegramButton>
              <p className="text-fg-3 text-[13.5px]">
                Доработки после первой недели оплачиваются отдельно.
              </p>
            </div>
          </div>

          <div className="border-line rounded-3xl border p-7 sm:p-9 lg:col-span-5">
            <h3 className="text-fg text-[20px] font-semibold tracking-[-0.02em]">
              Как подключиться
            </h3>
            <ol className="mt-7 flex flex-col">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className="bg-line absolute top-8 bottom-1 left-[13px] w-px"
                    />
                  ) : null}
                  <span className="tabular border-line-strong text-fg-2 grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[12px]">
                    {i + 1}
                  </span>
                  <span className="flex flex-col pt-0.5">
                    <span className="text-fg text-[16px] font-semibold">{step.title}</span>
                    <span className="text-fg-2 mt-1 text-[14.5px] leading-relaxed">
                      {step.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
