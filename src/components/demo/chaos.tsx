"use client";

import { useEffect, useRef } from "react";
import { LogoMark } from "../logo-mark";

/** Мысли «в голове»: разбросаны по сцене, при прокрутке стягиваются в ассистента. */
const THOUGHTS: {
  text: string;
  x: number;
  y: number;
  r: number;
  tone: "loud" | "quiet" | "base";
}[] = [
  { text: "созвон с Азаматом в 10?", x: 0.1, y: 0.2, r: -6, tone: "base" },
  { text: "КОРМ КОТУ!!!", x: 0.74, y: 0.14, r: 5, tone: "loud" },
  { text: "отчёт до пятницы…", x: 0.06, y: 0.62, r: 4, tone: "base" },
  { text: "стоматолог — перенести", x: 0.7, y: 0.7, r: -4, tone: "quiet" },
  { text: "договор отправить утром", x: 0.3, y: 0.08, r: 3, tone: "quiet" },
  { text: "обед с командой в 13", x: 0.56, y: 0.86, r: -2, tone: "base" },
  { text: "зарядку бы начать", x: 0.82, y: 0.44, r: 7, tone: "quiet" },
  { text: "продлить страховку!!", x: 0.16, y: 0.84, r: -5, tone: "loud" },
  { text: "маме позвонить", x: 0.02, y: 0.4, r: 6, tone: "base" },
];

const ORDERED: { time: string; title: string }[] = [
  { time: "07:30", title: "Зарядка · каждый день" },
  { time: "09:00", title: "Отправить договор" },
  { time: "10:00", title: "Созвон с Азаматом" },
  { time: "13:00", title: "Обед с командой" },
  { time: "до пт", title: "Сдать отчёт" },
  { time: "пн 16:00", title: "Стоматолог" },
  { time: "сегодня", title: "Купить корм коту" },
  { time: "вечером", title: "Позвонить маме" },
  { time: "на неделе", title: "Продлить страховку" },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function Chaos() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const titleARef = useRef<HTMLHeadingElement>(null);
  const titleBRef = useRef<HTMLHeadingElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? clamp(-rect.top / range) : 1;
      const w = stage.clientWidth;
      const h = stage.clientHeight;

      chipRefs.current.forEach((chip, i) => {
        if (!chip) return;
        const th = THOUGHTS[i];
        const t = ease(clamp((p - 0.18 - i * 0.025) / 0.4));
        const sx = Math.max(4, Math.min(th.x * w, w - chip.offsetWidth - 4));
        const sy = Math.max(4, Math.min(th.y * h, h - chip.offsetHeight - 4));
        const tx = w / 2 - chip.offsetWidth / 2;
        const ty = h * 0.5 - chip.offsetHeight / 2;
        const x = sx + (tx - sx) * t;
        const y = sy + (ty - sy) * t;
        const scale = 1 - 0.75 * t;
        const rot = th.r * (1 - t);
        chip.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
        chip.style.opacity = String(1 - clamp((t - 0.78) / 0.22));
      });

      const core = coreRef.current;
      if (core) {
        // Ассистент «вбирает» мысли: знак вспыхивает, пока они к нему летят
        const pull = clamp((p - 0.18) / 0.5);
        const fade = clamp((p - 0.62) / 0.12);
        core.style.opacity = String(Math.min(pull * 2, 1) * (1 - fade));
        core.style.transform = `translate(-50%, -50%) scale(${0.8 + 0.35 * Math.sin(pull * Math.PI)})`;
      }

      const r = clamp((p - 0.64) / 0.22);
      if (resultRef.current) {
        resultRef.current.style.opacity = String(r);
        resultRef.current.style.transform = `translate(-50%, calc(-50% + ${(1 - r) * 24}px)) scale(${0.96 + 0.04 * r})`;
        resultRef.current.style.pointerEvents = r > 0.5 ? "auto" : "none";
        resultRef.current.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
          const rr = clamp((p - 0.66 - i * 0.018) / 0.1);
          row.style.opacity = String(rr);
          row.style.transform = `translateY(${(1 - rr) * 8}px)`;
        });
      }

      const swap = clamp((p - 0.5) / 0.14);
      if (titleARef.current) titleARef.current.style.opacity = String(1 - swap);
      if (titleBRef.current) titleBRef.current.style.opacity = String(swap);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section aria-labelledby="chaos-title" className="border-line border-t">
      <div ref={trackRef} className="relative h-[260vh]">
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden">
          <div className="relative mx-auto w-full max-w-[1200px] px-4 pt-12 text-center sm:px-6 sm:pt-16 lg:px-8">
            <div className="relative mx-auto grid max-w-3xl">
              <h2
                id="chaos-title"
                ref={titleARef}
                className="display text-fg col-start-1 row-start-1 text-[clamp(2rem,4.6vw,3.5rem)]"
              >
                Сколько дел ты сейчас держишь в&nbsp;голове?
              </h2>
              <h2
                ref={titleBRef}
                aria-hidden
                className="display text-fg col-start-1 row-start-1 text-[clamp(2rem,4.6vw,3.5rem)] opacity-0"
              >
                Одно голосовое — и&nbsp;всё на&nbsp;своих местах.
              </h2>
            </div>
          </div>

          <div ref={stageRef} className="relative mx-auto w-full max-w-[1100px] flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(42_170_254/0.16),transparent)]"
            />

            <ul aria-label="Дела, которые держишь в голове">
              {THOUGHTS.map((t, i) => (
                <li key={t.text} className="contents">
                  <span
                    ref={(el) => {
                      chipRefs.current[i] = el;
                    }}
                    className="absolute top-0 left-0 will-change-transform"
                  >
                    <span
                      className={`block rounded-2xl px-3.5 py-2 whitespace-nowrap shadow-[0_12px_30px_-12px_rgb(0_0_0/0.8)] ${
                        t.tone === "loud"
                          ? "bg-[#2a1c22] text-[15px] font-semibold text-[#ffb4a8] ring-1 ring-[#ff8a7a]/25"
                          : t.tone === "quiet"
                            ? "bg-ink-850 text-fg-3 ring-line text-[13.5px] ring-1"
                            : "bg-ink-800 text-fg-2 ring-line-strong text-[14.5px] ring-1"
                      }`}
                      style={{
                        animation: `drift ${5 + (i % 4)}s ${i * -0.7}s ease-in-out infinite alternate`,
                      }}
                    >
                      {t.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div
              ref={coreRef}
              aria-hidden
              className="bg-ink-950 ring-sky/40 absolute top-1/2 left-1/2 grid size-20 place-items-center rounded-[26px] opacity-0 shadow-[0_0_60px_rgb(42_170_254/0.35)] ring-1"
            >
              <LogoMark className="h-7 w-auto" />
            </div>

            <div
              ref={resultRef}
              className="border-sky/30 bg-ink-900 absolute top-1/2 left-1/2 w-[min(400px,calc(100%-2rem))] rounded-3xl border p-5 opacity-0 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.05)]"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-fg text-[15px] font-semibold">Всё записано</span>
                <span className="text-fg-3 text-[12px]">Google Календарь · Telegram</span>
              </div>
              <ul className="flex flex-col gap-1">
                {ORDERED.map((row) => (
                  <li
                    key={row.title}
                    data-row
                    className="bg-sky/[0.08] ring-sky/20 flex items-center gap-3 rounded-xl px-3 py-[7px] ring-1"
                  >
                    <span className="tabular text-sky w-[76px] shrink-0 font-mono text-[12px]">
                      {row.time}
                    </span>
                    <span className="text-fg truncate text-[14px]">{row.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
