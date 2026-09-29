import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Bubble } from "../chat";
import { Container, SectionHeading } from "../ui";

function Tile({
  title,
  text,
  children,
  className = "",
}: {
  title: string;
  text: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`border-line bg-ink-900 flex flex-col overflow-hidden rounded-3xl border shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] ${className}`}
    >
      <div className="px-6 pt-6 sm:px-7 sm:pt-7">
        <h3 className="text-fg text-[20px] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="text-fg-2 mt-2 max-w-md text-[15px] leading-relaxed">{text}</p>
      </div>
      <div className="bg-tg-bg mt-6 flex flex-1 flex-col justify-center border-t border-white/[0.05] p-4 sm:p-5">
        {children}
      </div>
    </article>
  );
}

const COMMANDS: [string, string][] = [
  ["Сделал отчёт", "✅ Отметил: Отчёт"],
  ["Перенеси стоматолога на понедельник", "📅 Перенёс: Стоматолог → пн"],
  ["Удали задачу купить корм", "🗑 Удалил: Купить корм"],
  ["Что у меня сегодня?", "Список дел на сегодня"],
  ["На чём мне сегодня сфокусироваться?", "Совет по твоим задачам"],
];

const WEEK: { d: string; s: "done" | "miss" | "next" }[] = [
  { d: "Пн", s: "done" },
  { d: "Вт", s: "done" },
  { d: "Ср", s: "miss" },
  { d: "Чт", s: "done" },
  { d: "Пт", s: "done" },
  { d: "Сб", s: "next" },
  { d: "Вс", s: "next" },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="border-line border-t py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          id="features-title"
          title="Говоришь как обычно — он понимает"
          lead="Никаких форм и полей. Дела, переносы, отметки и вопросы — обычными словами в одном чате."
        />
        <p className="text-fg-3 mt-5 text-[13px]">Переписки ниже — демонстрация.</p>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <Tile
            className="lg:col-span-7"
            title="Пиши как человеку"
            text="Одно сообщение — одно действие: записать, отметить, перенести, удалить или спросить, что важно сегодня."
          >
            <ul className="flex flex-col divide-y divide-white/[0.05]">
              {COMMANDS.map(([say, result]) => (
                <li
                  key={say}
                  className="flex flex-col gap-1.5 py-2.5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:gap-3"
                >
                  <span className="bg-tg-out w-fit rounded-xl rounded-br-sm px-2.5 py-1.5 text-[13.5px] text-[#f5f7fa]">
                    {say}
                  </span>
                  <ArrowRight className="text-fg-3 hidden size-3.5 shrink-0 sm:block" aria-hidden />
                  <span className="text-[13.5px] text-[#c9d6e3] sm:ml-auto">{result}</span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile
            className="lg:col-span-5"
            title="Повторы и привычки"
            text="Каждый день, по будням, раз в N дней или раз в месяц — с концом серии. Пропуски тоже видно."
          >
            <div className="flex flex-col gap-2">
              <Bubble side="out" time="07:12">
                Каждый день в 15:00 50 отжиманий 30 дней
              </Bubble>
              <Bubble time="07:12">
                ✅ Сохранил: 50 отжиманий{"\n"}Каждый день в 15:00 · 30 дней
                <span
                  className="mt-3 flex gap-1.5"
                  aria-label="Отметки за неделю: 4 выполнено, 1 пропуск"
                >
                  {WEEK.map((w) => (
                    <span key={w.d} className="flex flex-col items-center gap-1">
                      <span
                        className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold ${
                          w.s === "done"
                            ? "bg-mint/20 text-mint"
                            : w.s === "miss"
                              ? "bg-white/[0.04] text-[#6d7f8f] line-through"
                              : "text-[#6d7f8f] ring-1 ring-white/10"
                        }`}
                      >
                        {w.s === "done" ? "✓" : w.s === "miss" ? "—" : ""}
                      </span>
                      <span className="text-[10.5px] text-[#6d7f8f]">{w.d}</span>
                    </span>
                  ))}
                </span>
              </Bubble>
            </div>
          </Tile>

          <Tile
            className="lg:col-span-5"
            title="Просроченное — в два нажатия"
            text="После утреннего плана бот сам покажет хвосты. Сделано, на сегодня, на завтра или удалить."
          >
            <div className="flex flex-col gap-2">
              <Bubble time="08:01" buttons={[["Готово", "Сегодня", "Завтра", "Удалить"]]}>
                Просрочено: Отправить договор
              </Bubble>
              <Bubble time="08:01" buttons={[["Готово", "Сегодня", "Завтра", "Удалить"]]}>
                Просрочено: Записаться к стоматологу
              </Bubble>
            </div>
          </Tile>

          <Tile
            className="lg:col-span-7"
            title="Файлы и заметки — на Google Диск"
            text="Кинь документ или фото — он окажется на Диске, а подпись к нему станет задачей. Заметки тоже ложатся на Диск."
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-end">
                <div className="bg-tg-out max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-[14px] text-[#f5f7fa]">
                  <span className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-full bg-[#5aa3e6] text-[10px] font-bold">
                      PDF
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="font-medium">Договор.pdf</span>
                      <span className="text-[12px] text-[#9cc8f0]">240 КБ</span>
                    </span>
                  </span>
                  <span className="mt-1.5 block">Завтра в 12 прочитать договор</span>
                </div>
              </div>
              <Bubble time="18:02">✅ Сохранил: Прочитать договор — завтра, 12:00</Bubble>
              <Bubble side="out" time="18:05">
                Сохрани заметку: идея подарка — настольная лампа
              </Bubble>
              <Bubble time="18:05">📝 Записал на Диск: note-идея-подарка.txt</Bubble>
            </div>
          </Tile>
        </div>
      </Container>
    </section>
  );
}
