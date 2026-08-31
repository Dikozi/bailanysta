"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import type { Page, UserSummary } from "@/types";

export function UserListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserList({
  query,
  emptyText,
}: {
  query: UseInfiniteQueryResult<InfiniteData<Page<UserSummary>>, Error>;
  emptyText: string;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <UserListSkeleton />;

  const users = data?.pages.flatMap((page) => page.items) ?? [];
  if (users.length === 0) {
    return <p className="px-6 py-12 text-center text-sm text-ink-muted">{emptyText}</p>;
  }

  return (
    <div>
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/u/${user.username}`}
          className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3.5 transition-colors hover:bg-surface-hover"
        >
          <Avatar displayName={user.displayName} avatarColor={user.avatarColor} />
          <span className="min-w-0">
            <span className="block truncate font-bold">{user.displayName}</span>
            <span className="block truncate text-[14px] text-ink-muted">@{user.username}</span>
          </span>
        </Link>
      ))}

      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6 text-ink-muted">
          <Spinner className="size-5" />
        </div>
      )}
    </div>
  );
}
