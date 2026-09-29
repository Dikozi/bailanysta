"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Bubble, ChatWindow, Typing, VoiceBubble } from "../chat";

type CalEvent = { start: number; end: number; title: string; done?: boolean };

type Beat =
  | { at: number; kind: "voice"; duration: string; time: string }
  | { at: number; kind: "out"; text: string; time: string }
  | { at: number; kind: "typing" }
  | { at: number; kind: "bot"; text: string; time: string; buttons?: string[][] }
  | { at: number; kind: "cal"; event: CalEvent }
  | { at: number; kind: "toast" };

type Scenario = {
  id: string;
  label: string;
  day: string;
  calInit: CalEvent | null;
  /** Что будет с напоминанием — подпись для телефона, пока уведомление не пришло */
  reminder: string;
  beats: Beat[];
};

const CALL = "Созвон с Азаматом";

const SCENARIOS: Scenario[] = [
  {
    id: "add",
    label: "Записать голосом",
    day: "Завтра",
    calInit: null,
    reminder: "Напоминание придёт завтра в 09:50",
    beats: [
      { at: 0, kind: "voice", duration: "0:07", time: "21:14" },
      { at: 900, kind: "typing" },
      {
        at: 1700,
        kind: "bot",
        time: "21:14",
        text: "«Завтра в 10 созвон с Азаматом на час, до пятницы сдать отчёт, купить корм коту»",
      },
      { at: 2400, kind: "typing" },
      {
        at: 3200,
        kind: "bot",
        time: "21:14",
        text: "✅ Сохранил: 3 задачи, 1 событие\n\n• Созвон с Азаматом — завтра, 10:00–11:00\n• Сдать отчёт — до пятницы\n• Купить корм коту",
        buttons: [["↩️ Отменить"]],
      },
      { at: 3700, kind: "cal", event: { start: 10, end: 11, title: CALL } },
      { at: 5000, kind: "toast" },
    ],
  },
  {
    id: "move",
    label: "Перенести словами",
    day: "Завтра",
    calInit: { start: 10, end: 11, title: CALL },
    reminder: "Напоминание переедет на 14:50",
    beats: [
      { at: 0, kind: "out", text: "Перенеси созвон с Азаматом на 15:00", time: "21:16" },
      { at: 800, kind: "typing" },
      {
        at: 1600,
        kind: "bot",
        time: "21:16",
        text: "📅 Перенёс: Созвон с Азаматом → завтра, 15:00",
        buttons: [["↩️ Отменить"]],
      },
      { at: 2000, kind: "cal", event: { start: 15, end: 16, title: CALL } },
    ],
  },
  {
    id: "done",
    label: "Отметить готовое",
    day: "Сегодня",
    calInit: { start: 15, end: 16, title: CALL },
    reminder: "Дело закрыто — напоминаний больше не будет",
    beats: [
      { at: 0, kind: "out", text: "Созвон провёл", time: "16:04" },
      { at: 800, kind: "typing" },
      {
        at: 1600,
        kind: "bot",
        time: "16:04",
        text: "✅ Отметил: Созвон с Азаматом",
        buttons: [["↩️ Не сделано"]],
      },
      { at: 2000, kind: "cal", event: { start: 15, end: 16, title: CALL, done: true } },
    ],
  },
];

const HOLD_AFTER = 4200;
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const ROW = 40;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

export function HeroDemo() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [visible, setVisible] = useState(true);
  const [runKey, setRunKey] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const scenario = SCENARIOS[index];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Сценарий проигрывается, пока демо на экране; при уходе с экрана — с начала.
  useEffect(() => {
    if (reduced || !visible) return;
    const timers = scenario.beats.map((beat, i) =>
      window.setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), beat.at + 250),
    );
    const last = scenario.beats[scenario.beats.length - 1].at;
    if (autoplay) {
      timers.push(
        window.setTimeout(
          () => {
            setRevealed(0);
            setIndex((i) => (i + 1) % SCENARIOS.length);
          },
          last + 250 + HOLD_AFTER,
        ),
      );
    }
    return () => timers.forEach(window.clearTimeout);
  }, [index, runKey, reduced, visible, autoplay, scenario]);

  const choose = useCallback((i: number) => {
    setAutoplay(false);
    setRevealed(0);
    setIndex(i);
    setRunKey((k) => k + 1);
  }, []);

  // Без анимаций сразу показываем финал сценария.
  const count = reduced ? scenario.beats.length : revealed;
  const shown = scenario.beats.slice(0, count);
  const lastShown = shown[shown.length - 1];
  const cal = shown.reduce<CalEvent | null>(
    (acc, b) => (b.kind === "cal" ? b.event : acc),
    scenario.calInit,
  );
  const calChanged = shown.some((b) => b.kind === "cal");
  const toast = shown.some((b) => b.kind === "toast");

  return (
    <div ref={rootRef} className="relative">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_236px]">
        <ChatWindow status={lastShown?.kind === "typing" ? "печатает…" : "бот"}>
          <div
            className="flex h-[318px] flex-col justify-end gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_56px)] sm:h-[352px] sm:[mask-image:none]"
            aria-live="polite"
          >
            {shown.map((beat, i) => {
              const key = `${scenario.id}-${runKey}-${i}`;
              const anim = !reduced;
              switch (beat.kind) {
                case "voice":
                  return (
                    <VoiceBubble
                      key={key}
                      duration={beat.duration}
                      time={beat.time}
                      animate={anim}
                      playing={anim && count === 1}
                    />
                  );
                case "out":
                  return (
                    <Bubble key={key} side="out" time={beat.time} animate={anim}>
                      {beat.text}
                    </Bubble>
                  );
                case "typing":
                  return beat === lastShown ? <Typing key={key} /> : null;
                case "bot":
                  return (
                    <Bubble key={key} time={beat.time} buttons={beat.buttons} animate={anim}>
                      {beat.text}
                    </Bubble>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </ChatWindow>

        <CalendarDay
          day={scenario.day}
          event={cal}
          animateKey={calChanged ? `${runKey}-${index}-cal` : `${runKey}-${index}-init`}
          reduced={reduced || !calChanged}
        />
        <CalendarStrip
          day={scenario.day}
          event={cal}
          animateKey={`${runKey}-${index}-${calChanged}`}
          reduced={reduced || !calChanged}
        />
      </div>

      {toast ? (
        <div className="absolute right-[-12px] bottom-[74px] z-10 hidden w-[300px] sm:block">
          <ReminderToast reduced={reduced} />
        </div>
      ) : null}

      {/* На телефоне уведомление встаёт в свой слот и ничего не перекрывает */}
      <div className="mt-3 min-h-[88px] sm:hidden">
        {toast ? (
          <ReminderToast reduced={reduced} />
        ) : (
          <p className="border-line text-fg-3 flex min-h-[88px] items-center justify-center rounded-2xl border border-dashed px-4 text-center text-[13px]">
            {scenario.reminder}
          </p>
        )}
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Примеры сценариев"
      >
        {SCENARIOS.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={active}
              onClick={() => choose(i)}
              className={`relative overflow-hidden rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                active
                  ? "border-sky/40 bg-sky/10 text-fg"
                  : "border-line text-fg-2 hover:border-line-strong hover:text-fg"
              }`}
            >
              {s.label}
              {active && autoplay && !reduced ? (
                <span
                  key={`${index}-${runKey}`}
                  className="bg-sky/70 absolute inset-x-3 bottom-0 h-px origin-left"
                  style={{
                    animation: `progress ${scenario.beats[scenario.beats.length - 1].at + 250 + HOLD_AFTER}ms linear both`,
                    animationPlayState: visible ? "running" : "paused",
                  }}
                />
              ) : null}
            </button>
          );
        })}
        <span className="text-fg-3 ml-auto hidden text-[12px] sm:inline">
          Демонстрация — так выглядят ответы бота
        </span>
      </div>
    </div>
  );
}

function CalendarDay({
  day,
  event,
  animateKey,
  reduced,
}: {
  day: string;
  event: CalEvent | null;
  animateKey: string;
  reduced: boolean;
}) {
  return (
    <div className="border-line bg-ink-850 hidden overflow-hidden rounded-2xl border sm:block">
      <div className="border-line flex items-baseline justify-between border-b px-3.5 py-3">
        <span className="text-fg text-[13px] font-semibold">{day}</span>
        <span className="text-fg-3 text-[11.5px]">Google Календарь</span>
      </div>
      <div className="relative px-2 pt-2 pb-3" style={{ height: HOURS.length * ROW + 20 }}>
        {HOURS.map((h, i) => (
          <div
            key={h}
            className="absolute inset-x-2 flex items-start gap-2"
            style={{ top: 8 + i * ROW }}
          >
            <span className="tabular text-fg-3 w-9 -translate-y-1.5 text-right font-mono text-[10.5px]">
              {String(h).padStart(2, "0")}:00
            </span>
            <span className="bg-line h-px flex-1" />
          </div>
        ))}

        {/* Событие, которое уже было в календаре: план дня учитывает и его */}
        <div
          className="border-line bg-ink-700/70 absolute right-2 left-[52px] rounded-lg border px-2 py-1.5"
          style={{ top: 8 + (13 - 9) * ROW + 1, height: ROW - 3 }}
        >
          <span className="text-fg-2 block truncate text-[11.5px] leading-tight">
            Обед с командой
          </span>
        </div>

        {event ? (
          <div
            key={animateKey}
            className={`absolute right-2 left-[52px] rounded-lg px-2 py-1.5 transition-colors duration-500 ${
              reduced ? "" : "anim-event"
            } ${event.done ? "bg-mint/15 ring-mint/40 ring-1" : "bg-sky/20 ring-sky/45 ring-1"}`}
            style={{
              top: 8 + (event.start - 9) * ROW + 1,
              height: (event.end - event.start) * ROW - 3,
            }}
          >
            <span
              className={`block truncate text-[11.5px] leading-tight font-semibold ${event.done ? "text-mint" : "text-[#cfe6ff]"}`}
            >
              {event.done ? "✅ " : ""}
              {event.title}
            </span>
            <span className="tabular text-fg-2 block font-mono text-[10px]">
              {String(event.start).padStart(2, "0")}:00–{String(event.end).padStart(2, "0")}:00
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** На телефоне вместо сетки часов — одна строка календаря. */
function CalendarStrip({
  day,
  event,
  animateKey,
  reduced,
}: {
  day: string;
  event: CalEvent | null;
  animateKey: string;
  reduced: boolean;
}) {
  return (
    <div className="border-line bg-ink-850 flex min-h-[58px] items-center gap-3 rounded-2xl border px-3.5 py-2.5 sm:hidden">
      <span className="flex flex-col leading-tight">
        <span className="text-fg text-[12.5px] font-semibold">{day}</span>
        <span className="text-fg-3 text-[11px]">Google Календарь</span>
      </span>
      {event ? (
        <span
          key={animateKey}
          className={`ml-auto flex min-w-0 flex-col rounded-lg px-2.5 py-1.5 ${reduced ? "" : "anim-event"} ${
            event.done ? "bg-mint/15 ring-mint/40 ring-1" : "bg-sky/20 ring-sky/45 ring-1"
          }`}
        >
          <span
            className={`truncate text-[12px] leading-tight font-semibold ${event.done ? "text-mint" : "text-[#cfe6ff]"}`}
          >
            {event.done ? "✅ " : ""}
            {event.title}
          </span>
          <span className="tabular text-fg-2 font-mono text-[10.5px]">
            {String(event.start).padStart(2, "0")}:00–{String(event.end).padStart(2, "0")}:00
          </span>
        </span>
      ) : (
        <span className="text-fg-3 ml-auto text-[12px]">пока пусто</span>
      )}
    </div>
  );
}

function ReminderToast({ reduced }: { reduced: boolean }) {
  return (
    <div className={reduced ? "" : "anim-toast"} role="status">
      <div className="rounded-2xl border border-white/10 bg-[#1b2436]/95 p-3 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md">
        <div className="text-fg-3 flex items-center gap-2 text-[11.5px]">
          <span className="grid size-4 place-items-center rounded-[5px] bg-[#2aabee]">
            <svg
              viewBox="0 0 24 24"
              className="size-2.5 text-white"
              fill="currentColor"
              aria-hidden
            >
              <path d="M21.4 4.6 2.9 11.7c-1.3.5-1.2 1.3-.2 1.6l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.5Z" />
            </svg>
          </span>
          <span>My Assist</span>
          <span className="ml-auto">завтра, 09:50</span>
        </div>
        <p className="text-fg mt-1.5 text-[13.5px] font-semibold">⏰ Через 10 мин</p>
        <p className="text-fg-2 text-[13px]">Созвон с Азаматом · 10:00</p>
      </div>
    </div>
  );
}
