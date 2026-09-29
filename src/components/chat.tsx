import type { ReactNode } from "react";
import { LogoMark } from "./brand";

type Side = "in" | "out";

export function Bubble({
  side = "in",
  time,
  children,
  className = "",
  buttons,
  animate = false,
}: {
  side?: Side;
  time?: string;
  children: ReactNode;
  className?: string;
  buttons?: string[][];
  animate?: boolean;
}) {
  const isOut = side === "out";
  return (
    <div
      className={`flex flex-col ${isOut ? "items-end" : "items-start"} ${animate ? "anim-msg" : ""} ${className}`}
    >
      <div
        className={`relative max-w-[92%] rounded-2xl px-3 py-2 text-[14px] leading-[1.45] text-[#f5f7fa] sm:max-w-[85%] ${
          isOut ? "bg-tg-out rounded-br-md" : "bg-tg-in rounded-bl-md"
        }`}
      >
        <div className="whitespace-pre-line">{children}</div>
        {time ? (
          <span
            className={`tabular float-right mt-1.5 ml-3 translate-y-0.5 text-[11px] leading-none ${
              isOut ? "text-[#7da8d3]" : "text-[#6d7f8f]"
            }`}
          >
            {time}
            {isOut ? <DoubleCheck /> : null}
          </span>
        ) : null}
      </div>
      {buttons ? <InlineKeyboard rows={buttons} /> : null}
    </div>
  );
}

function DoubleCheck() {
  return (
    <svg viewBox="0 0 16 10" className="ml-1 inline-block h-2.5 w-3.5 align-[-1px]" aria-hidden>
      <path
        d="m1 5.2 2.6 2.6L9.4 2M6.8 7.6 7.8 8.6 14.6 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InlineKeyboard({ rows }: { rows: string[][] }) {
  return (
    <div className="mt-1 flex w-full max-w-[92%] flex-col gap-1 sm:max-w-[85%]">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((label) => (
            <span
              key={label}
              className="bg-tg-btn/90 flex-1 truncate rounded-lg px-1 py-1.5 text-center text-[12.5px] font-medium text-[#e9eef3]"
            >
              {label}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function VoiceBubble({
  duration,
  time,
  animate = false,
  playing = false,
}: {
  duration: string;
  time?: string;
  animate?: boolean;
  playing?: boolean;
}) {
  const bars = [
    5, 9, 14, 8, 12, 18, 11, 7, 15, 20, 13, 9, 6, 11, 16, 10, 14, 19, 12, 8, 5, 9, 13, 7, 4,
  ];
  return (
    <div className={`flex flex-col items-end ${animate ? "anim-msg" : ""}`}>
      <div className="bg-tg-out flex items-center gap-2.5 rounded-2xl rounded-br-md py-2 pr-3 pl-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#5aa3e6] text-white">
          <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor" aria-hidden>
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
          </svg>
        </span>
        <span className="flex flex-col gap-1">
          <span className="flex h-5 items-center gap-[2px]" aria-hidden>
            {bars.map((h, i) => (
              <span
                key={i}
                className="w-[2.5px] origin-center rounded-full bg-[#9cc8f0]"
                style={{
                  height: `${h}px`,
                  animation: playing ? `wave 900ms ${i * 45}ms ease-in-out infinite` : undefined,
                }}
              />
            ))}
          </span>
          <span className="tabular flex justify-between gap-6 text-[11px] leading-none text-[#7da8d3]">
            <span>{duration}</span>
            {time ? (
              <span>
                {time}
                <DoubleCheck />
              </span>
            ) : null}
          </span>
        </span>
      </div>
      <span className="sr-only">Голосовое сообщение, {duration}</span>
    </div>
  );
}

export function Typing() {
  return (
    <div className="anim-msg flex items-start" aria-hidden>
      <div className="bg-tg-in flex gap-1 rounded-2xl rounded-bl-md px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-[#8fa3b5]"
            style={{ animation: `typing 1.1s ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatHeader({ status = "бот" }: { status?: string }) {
  return (
    <div className="bg-tg-head flex items-center gap-3 border-b border-black/30 px-4 py-2.5">
      <span className="grid size-9 place-items-center rounded-full bg-gradient-to-b from-[#7cc0ff] to-[#3d8be6]">
        <LogoMark className="size-5 text-white [&_path:last-child]:stroke-[#2f7de1]" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[14.5px] font-semibold text-[#f5f7fa]">My Assist</span>
        <span className="text-[12.5px] text-[#6d8196]">{status}</span>
      </span>
    </div>
  );
}

/** Окно чата: тёмная тема Telegram, без выдуманных элементов интерфейса. */
export function ChatWindow({
  children,
  className = "",
  status,
}: {
  children: ReactNode;
  className?: string;
  status?: string;
}) {
  return (
    <div
      className={`bg-tg-bg overflow-hidden rounded-2xl border border-white/[0.06] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7),0_2px_6px_rgb(0_0_0/0.4)] ${className}`}
    >
      <ChatHeader status={status} />
      <div className="flex flex-col gap-2 px-3 py-4 sm:px-4">{children}</div>
    </div>
  );
}
