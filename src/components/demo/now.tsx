"use client";

import { useSyncExternalStore } from "react";

/** Минуты от начала дня по часам посетителя; обновляются раз в 30 секунд. */
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

const read = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export function useNowMinutes(): number | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export const formatClock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Пометка «сейчас» у момента дня, в который попадает текущее время. */
export function NowBadge({ from, to }: { from: number; to: number | null }) {
  const now = useNowMinutes();
  if (now === null) return null;
  const inside = now >= from && (to === null ? now < 24 * 60 : now < to);
  if (!inside) return null;
  return (
    <span className="bg-sky/15 text-sky ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 align-middle font-sans text-[11.5px] font-medium">
      <span className="bg-sky size-1.5 animate-pulse rounded-full" />
      сейчас {formatClock(now)}
    </span>
  );
}
