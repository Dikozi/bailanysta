"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/post/PostList";
import { Spinner } from "@/components/ui/Spinner";
import { useFeed } from "@/hooks/usePosts";
import type { Page, Post } from "@/types";

/**
 * Посты автора выводятся сеткой-плиткой, как в профиле Instagram.
 *
 * Это не украшательство: плитка визуально отличает профиль от ленты, а из
 * карточки уходят аватар и имя — на странице одного автора они повторялись бы
 * в каждом посте.
 *
 * Сетка, а не колоночная раскладка (CSS columns): при колонках браузер
 * заполняет сначала левую колонку целиком, и хронология читается неверно —
 * сверху вниз слева, потом заново сверху справа. Grid идёт слева направо,
 * то есть в том порядке, в каком посты написаны.
 */
export function ProfileFeed({
  authorId,
  initialPage,
  emptyState,
}: {
  authorId: string;
  initialPage: Page<Post>;
  emptyState: React.ReactNode;
}) {
  const query = useFeed({ authorId }, initialPage);
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return (
      <div className="grid items-start gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
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
    <div>
      {/* items-start — иначе grid растянул бы короткий пост до высоты длинного. */}
      <div className="grid items-start gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="tile" />
        ))}
      </div>

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
    </div>
  );
}
