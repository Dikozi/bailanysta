import { DayCinema } from "../demo/day-cinema";
import { NowBadge } from "../demo/now";
import { MOMENTS } from "./day-moments";
import { Container, SectionHeading } from "../ui";

export function Day() {
  return (
    <section id="day" aria-labelledby="day-title" className="border-line border-t">
      <Container className="grid gap-14 py-24 sm:py-32 lg:hidden lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
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
          {MOMENTS.map((m, i) => (
            <li key={m.time} className="relative pb-14 pl-8 last:pb-0 sm:pl-10">
              <span
                aria-hidden
                className="border-ink-950 bg-sky ring-sky/40 absolute top-[7px] left-0 size-[11px] rounded-full border-2 ring-1 sm:size-[15px]"
              />
              <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8">
                <div>
                  <p className="tabular text-sky font-mono text-[13px]">
                    {m.time}
                    {m.day === "Сегодня" ? (
                      <NowBadge
                        from={i === 0 ? 0 : m.minutes}
                        to={MOMENTS[i + 1]?.day === "Сегодня" ? MOMENTS[i + 1].minutes : null}
                      />
                    ) : null}
                  </p>
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
      <DayCinema className="hidden lg:block" />
    </section>
  );
}
