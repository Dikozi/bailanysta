"use client";

import { PostList } from "@/components/post/PostList";
import { useFeed } from "@/hooks/usePosts";
import type { Page, Post } from "@/types";

export function TagFeed({
  tag,
  initialPage,
  emptyState,
}: {
  tag: string;
  initialPage: Page<Post>;
  emptyState: React.ReactNode;
}) {
  const query = useFeed({ tag }, initialPage);
  return <PostList query={query} emptyState={emptyState} />;
}
