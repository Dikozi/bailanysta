import type { ReactNode } from "react";
import { Bubble, VoiceBubble } from "../chat";
import { Container, SectionHeading } from "../ui";

type Moment = {
  time: string;
  title: string;
  note: string;
  chat: ReactNode;
};

const MOMENTS: Moment[] = [
  {
    time: "08:00",
    title: "Утренний план",
    note: "Приходит сам. Собирает задачи и встречи, которые уже стоят в календаре, и выделяет главное.",
    chat: (
      <Bubble time="08:00">
        <strong className="font-semibold">Жёсткие слоты</strong>
        {"\n"}10:00–11:00 — Созвон с Азаматом{"\n"}13:00–14:00 — Обед с командой{"\n\n"}
        <strong className="font-semibold">Главное сегодня</strong>
        {"\n"}1. Сдать отчёт — срок завтра{"\n"}2. Отправить договор{"\n\n"}
        <strong className="font-semibold">Второстепенное</strong>
        {"\n"}Купить корм коту
      </Bubble>
    ),
  },
  {
    time: "09:50",
    title: "Напоминание",
    note: "За 30 и за 10 минут до начала. Отметить, перенести или удалить — одной кнопкой.",
    chat: (
      <Bubble time="09:50" buttons={[["✅ Готово", "⏭ Завтра", "🗑 Удалить"]]}>
        ⏰ Через 10 мин{"\n"}Созвон с Азаматом · 10:00
      </Bubble>
    ),
  },
  {
    time: "10:20",
    title: "Если дело началось",
    note: "Спросит, взялся ли ты за него, — чтобы в итогах дня была правда, а не догадки.",
    chat: (
      <Bubble time="10:20" buttons={[["✅ Готово"]]}>
        Уже занялся «Созвон с Азаматом»? Отметь, когда закончишь.
      </Bubble>
    ),
  },
  {
    time: "13:40",
    title: "На ходу",
    note: "Между встречами — голосовое. Ассистент расшифрует и сам поймёт, что сделать.",
    chat: (
      <div className="flex flex-col gap-2">
        <VoiceBubble duration="0:03" time="13:40" />
        <Bubble time="13:40">
          «Перенеси стоматолога на понедельник»{"\n\n"}📅 Перенёс: Стоматолог → пн, 16:00
        </Bubble>
      </div>
    ),
  },
  {
    time: "21:00",
    title: "Вечерняя сверка",
    note: "Короткие итоги без лести, совет на завтра и одна кнопка, чтобы перенести остальное.",
    chat: (
      <Bubble
        time="21:00"
        buttons={[["✅ Отправить договор"], ["🌙 Остальное перенести на завтра"]]}
      >
        Сегодня закрыто 4 из 6. Отчёт сдан — это было главное. Договор переносится уже второй день:
        завтра начни с него.{"\n\n"}Что планируешь на завтра?
      </Bubble>
    ),
  },
  {
    time: "Вс, 20:00",
    title: "Итоги недели",
    note: "По воскресеньям — что получилось, что буксует и на чём сфокусироваться. Раз в месяц — большой разбор.",
    chat: (
      <Bubble time="20:00">
        <strong className="font-semibold">Что получилось</strong>
        {"\n"}Все созвоны прошли по плану, зарядка — 6 из 7 дней.{"\n\n"}
        <strong className="font-semibold">Что буксует</strong>
        {"\n"}Договор переносился три раза.{"\n\n"}
        <strong className="font-semibold">План на неделю</strong>
        {"\n"}Самое неприятное — до обеда. Принцип «Съешь лягушку».
      </Bubble>
    ),
  },
];

export function Day() {
  return (
    <section id="day" aria-labelledby="day-title" className="border-line border-t py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="day-title"
            title="Один день с ассистентом"
            lead="Ты пишешь, когда удобно. Всё остальное он присылает сам: план с утра, напоминания днём, итоги вечером."
          />
          <p className="text-fg-3 mt-6 text-[13px]">
            Пример дня. Задачи и имена — для демонстрации.
          </p>
        </div>

        <ol className="relative">
          <span
            aria-hidden
            className="bg-line absolute top-2 bottom-2 left-[5px] w-px sm:left-[7px]"
          />
          <span
            aria-hidden
            className="rail-fill bg-sky/70 absolute top-2 bottom-2 left-[5px] w-px sm:left-[7px]"
          />
          {MOMENTS.map((m) => (
            <li key={m.time} className="relative pb-14 pl-8 last:pb-0 sm:pl-10">
              <span
                aria-hidden
                className="border-ink-950 bg-sky ring-sky/40 absolute top-[7px] left-0 size-[11px] rounded-full border-2 ring-1 sm:size-[15px]"
              />
              <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8">
                <div>
                  <p className="tabular text-sky font-mono text-[13px]">{m.time}</p>
                  <h3 className="text-fg mt-1.5 text-[19px] font-semibold tracking-[-0.015em]">
                    {m.title}
                  </h3>
                  <p className="text-fg-2 mt-2 text-[15px] leading-relaxed">{m.note}</p>
                </div>
                <div className="bg-tg-bg max-w-[420px] rounded-2xl p-3 ring-1 ring-white/[0.05]">
                  {m.chat}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
