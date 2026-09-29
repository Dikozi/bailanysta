"use client";

import { useEffect, useRef, useState } from "react";
import { MOMENTS } from "../sections/day-moments";
import { LogoMark } from "../logo-mark";

/** Небо для каждого момента: цвет верха и свечение у горизонта (r, g, b, a). */
const SKY: { top: [number, number, number]; glow: [number, number, number, number] }[] = [
  { top: [12, 22, 48], glow: [255, 168, 112, 0.26] }, // 08:00 — рассвет
  { top: [11, 28, 62], glow: [140, 196, 255, 0.24] }, // 09:50
  { top: [12, 32, 70], glow: [150, 205, 255, 0.26] }, // 10:20
  { top: [14, 38, 82], glow: [176, 218, 255, 0.3] }, // 13:40 — день
  { top: [20, 16, 50], glow: [172, 124, 255, 0.26] }, // 21:00 — вечер
  { top: [7, 10, 26], glow: [96, 116, 210, 0.18] }, // Вс, 20:00 — ночь
];

const PER_MOMENT_VH = 70;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const pad = (n: number) => String(n).padStart(2, "0");
const clock = (minutes: number) =>
  `${pad(Math.floor(minutes / 60) % 24)}:${pad(Math.floor(minutes % 60))}`;

export function DayCinema({ className = "" }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      const pos = p * MOMENTS.length;
      const i = Math.min(MOMENTS.length - 1, Math.floor(pos));
      // Последняя часть каждого отрезка — переход к следующему моменту
      const t = Math.min(1, Math.max(0, (pos - i - 0.55) / 0.45));
      const next = Math.min(MOMENTS.length - 1, i + 1);

      const a = SKY[i];
      const b = SKY[next];
      stage.style.setProperty(
        "--sky-top",
        `rgb(${a.top.map((v, k) => Math.round(mix(v, b.top[k], t))).join(" ")})`,
      );
      stage.style.setProperty(
        "--sky-glow",
        `rgb(${a.glow
          .slice(0, 3)
          .map((v, k) => Math.round(mix(v, b.glow[k], t)))
          .join(" ")} / ${mix(a.glow[3], b.glow[3], t).toFixed(3)})`,
      );

      // Часы идут между моментами одного дня; в воскресенье — переключаются
      const cur = MOMENTS[i];
      const nxt = MOMENTS[next];
      const minutes =
        nxt.day === cur.day && next !== i ? mix(cur.minutes, nxt.minutes, t) : cur.minutes;
      const text = clock(minutes);
      if (clockRef.current && clockRef.current.textContent !== text) {
        clockRef.current.textContent = text;
      }
      if (statusRef.current && statusRef.current.textContent !== text) {
        statusRef.current.textContent = text;
      }
      setIndex((prev) => (prev === i ? prev : i));
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

  const jumpTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const range = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (range * (i + 0.3)) / MOMENTS.length, behavior: "smooth" });
  };

  const moment = MOMENTS[index];

  return (
    <div
      ref={trackRef}
      className={`relative ${className}`}
      style={{ height: `${MOMENTS.length * PER_MOMENT_VH + 100}vh` }}
    >
      <div
        ref={stageRef}
        className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden"
        style={{
          ["--sky-top" as string]: "rgb(12 22 48)",
          ["--sky-glow" as string]: "rgb(255 168 112 / 0.26)",
          background:
            "radial-gradient(120% 70% at 18% 108%, var(--sky-glow), transparent 62%), linear-gradient(to bottom, var(--sky-top), var(--color-ink-950) 88%)",
        }}
      >
        <div className="mx-auto grid h-full w-full max-w-[1200px] grid-cols-[minmax(0,6fr)_minmax(0,5fr)] items-center gap-12 px-8">
          <div className="flex h-full flex-col justify-between py-14">
            <div>
              <h2 className="display text-fg text-[clamp(2rem,3.4vw,2.75rem)]">
                Один день с ассистентом
              </h2>
              <p className="text-fg-2 mt-3 max-w-md text-[16px] leading-relaxed">
                Ты пишешь, когда удобно. Остальное он присылает сам.
              </p>
            </div>

            <div>
              <p className="text-fg-3 text-[14px] font-medium">{moment.day}</p>
              <span
                ref={clockRef}
                className="tabular text-fg block text-[clamp(5.5rem,10vw,8.5rem)] leading-[0.95] font-[450] tracking-[-0.04em]"
              >
                {moment.time.replace("Вс, ", "")}
              </span>
              <div key={moment.time} className="anim-msg mt-6 max-w-md">
                <h3 className="text-fg text-[26px] font-semibold tracking-[-0.02em]">
                  {moment.title}
                </h3>
                <p className="text-fg-2 mt-2 text-[17px] leading-relaxed">{moment.note}</p>
              </div>
            </div>

            <nav aria-label="Моменты дня">
              <ol className="flex gap-1.5">
                {MOMENTS.map((m, i) => (
                  <li key={m.time} className="flex-1">
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={i === index ? "step" : undefined}
                      aria-label={`${m.time} — ${m.title}`}
                      className="group w-full text-left"
                    >
                      <span
                        className={`block h-[3px] rounded-full transition-colors duration-300 ${
                          i <= index ? "bg-sky" : "bg-white/15 group-hover:bg-white/30"
                        }`}
                      />
                      <span
                        className={`tabular mt-2 block font-mono text-[11.5px] transition-colors duration-300 ${
                          i === index ? "text-fg" : "text-fg-3"
                        }`}
                      >
                        {m.time}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="text-fg-3 mt-4 text-[12.5px]">
                Пример дня. Задачи и имена — для демонстрации.
              </p>
            </nav>
          </div>

          <Phone statusRef={statusRef} time={moment.time.replace("Вс, ", "")}>
            {MOMENTS.slice(0, index + 1).map((m) => (
              <div key={m.time} className="anim-msg">
                {m.chat}
              </div>
            ))}
          </Phone>
        </div>
      </div>
    </div>
  );
}

function Phone({
  children,
  statusRef,
  time,
}: {
  children: React.ReactNode;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  time: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[52px] bg-[#0b0f18] p-[10px] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.08)]">
      <div className="bg-tg-bg relative flex h-[min(680px,calc(100vh-9rem))] flex-col overflow-hidden rounded-[42px]">
        <div className="flex items-center justify-between px-7 pt-3.5 pb-1 text-[13px] font-semibold text-white">
          <span ref={statusRef} className="tabular">
            {time}
          </span>
          <span aria-hidden className="h-[26px] w-[92px] rounded-full bg-black" />
          <span aria-hidden className="flex items-center gap-1">
            <svg viewBox="0 0 18 12" className="h-2.5 w-4" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5" width="3" height="7" rx="1" />
              <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <span className="h-2.5 w-5 rounded-[3px] border border-white/60 p-[1.5px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-white" />
            </span>
          </span>
        </div>
        <div className="bg-tg-head flex items-center gap-3 border-b border-black/30 px-4 py-2.5">
          <span className="bg-ink-950 grid size-9 place-items-center rounded-full ring-1 ring-white/10">
            <LogoMark className="h-3.5 w-auto" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[14.5px] font-semibold text-[#f5f7fa]">My Assist</span>
            <span className="text-[12.5px] text-[#6d8196]">бот</span>
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_72px)] px-3 pt-6 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
