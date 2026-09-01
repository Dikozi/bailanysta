"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { UserSummary } from "@/types";

/**
 * Горизонтальный ряд авторов — приём «историй» из Instagram.
 *
 * Историй у нас нет, поэтому кольцо означает не «есть непросмотренное»,
 * а просто ведёт в профиль автора. Ряд решает две задачи: даёт ленте
 * цветное пятно наверху и превращает подписки из абстракции в лица,
 * на которые можно нажать.
 */
export function AuthorsRail() {
  const { data, isLoading } = useQuery({
    queryKey: ["users", "active"],
    queryFn: () => api.get<UserSummary[]>("/users/active"),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section
      aria-label="Авторы"
      className="rounded-2xl border border-line bg-surface p-4 shadow-card"
    >
      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
        Авторы
      </h2>

      {/*
        Прокрутка скрывает полосу, но остаётся доступной с клавиатуры и
        колесом мыши. snap-x делает остановки на аватарах аккуратными.
      */}
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.map((author) => (
          <Link
            key={author.id}
            href={`/u/${author.username}`}
            className="group flex w-16 shrink-0 snap-start flex-col items-center gap-1.5"
            title={author.displayName}
          >
            {/* Кольцо — градиентная подложка, внутри отступ цветом фона карточки. */}
            <span className="avatar-ring rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105">
              <span className="block rounded-full bg-surface p-[2px]">
                <Avatar
                  displayName={author.displayName}
                  avatarColor={author.avatarColor}
                  size="lg"
                  className="size-12"
                />
              </span>
            </span>
            <span className="w-full truncate text-center text-[12px] text-ink-muted transition-colors group-hover:text-ink">
              {author.displayName.split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
