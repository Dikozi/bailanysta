"use client";

import { PostList } from "@/components/post/PostList";
import { useFeed } from "@/hooks/usePosts";
import type { Page, Post } from "@/types";

/** Лента конкретного автора — тот же PostList, только с фильтром по authorId. */
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
  return <PostList query={query} emptyState={emptyState} />;
}
