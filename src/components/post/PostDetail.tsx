"use client";

import { usePost } from "@/hooks/usePosts";
import type { Post } from "@/types";
import { PostCard } from "./PostCard";

/**
 * Одиночный пост. asLink=false — на своей же странице карточка не должна
 * вести сама на себя.
 */
export function PostDetail({ initialPost }: { initialPost: Post }) {
  const { data: post } = usePost(initialPost.id, initialPost);
  if (!post) return null;
  return <PostCard post={post} asLink={false} />;
}
