import { PostListSkeleton } from "@/components/post/PostList";

/** Показывается, пока серверный компонент страницы ждёт данные. */
export default function Loading() {
  return <PostListSkeleton />;
}
