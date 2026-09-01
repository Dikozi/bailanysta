"use client";

import { useEffect, useRef } from "react";
import type { UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import type { Page, Post } from "@/types";
import { PostCard } from "./PostCard";

/**
 * Скелетон повторяет геометрию настоящей карточки — аватар, две строки
 * заголовка, три строки текста, ряд действий. Заглушка «не той формы»
 * вызывает скачок вёрстки в момент подстановки данных, и это раздражает
 * сильнее, чем просто спиннер.
 */
export function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      </div>
      {/* Подвал с двумя кнопками — та же геометрия, что у настоящей карточки. */}
      <div className="mt-3 flex gap-2 border-t border-line px-4 py-2.5 sm:px-5">
        <Skeleton className="h-6 flex-1 rounded-xl" />
        <Skeleton className="h-6 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Загрузка постов" className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

type FeedQueryResult = UseInfiniteQueryResult<InfiniteData<Page<Post>>, Error>;

export function PostList({
  query,
  emptyState,
}: {
  query: FeedQueryResult;
  emptyState: React.ReactNode;
}) {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Догрузка при приближении к концу списка. Кнопка ниже остаётся как
  // запасной путь: IntersectionObserver не сработает, если браузер
  // восстановил позицию прокрутки мимо сентинела.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <PostListSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <AlertCircle className="size-6 text-danger" />
        <p className="text-sm text-ink-muted">{error.message}</p>
        <Button variant="secondary" size="sm" onClick={() => void query.refetch()}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  if (posts.length === 0) return <>{emptyState}</>;

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-6 text-ink-muted">
          <Spinner className="size-5" />
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Button variant="secondary" size="sm" onClick={() => void fetchNextPage()}>
            Показать ещё
          </Button>
        </div>
      )}

      {!hasNextPage && posts.length > 8 && (
        <p className="py-8 text-center text-[13px] text-ink-faint">Это все посты</p>
      )}
    </div>
  );
}
