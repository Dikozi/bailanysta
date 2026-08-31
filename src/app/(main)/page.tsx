import { FeedTabs } from "@/components/feed/FeedTabs";
import { PostComposer } from "@/components/post/PostComposer";
import { getSessionUserId } from "@/server/auth/session";
import { listPosts } from "@/server/services/posts";
import { PAGE_SIZE } from "@/lib/constants";

// Лента зависит от того, кто смотрит (лайки, «мой пост»), поэтому
// кешировать её на уровне маршрута нельзя.
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const viewerId = await getSessionUserId();

  // Первую страницу берём напрямую из сервиса, без похода в собственный HTTP:
  // это тот же код, что и в /api/v1/posts, но без лишнего сетевого прыжка.
  const initialPage = await listPosts({ feed: "global", limit: PAGE_SIZE }, viewerId);

  return (
    <>
      <PostComposer />
      <FeedTabs initialPage={initialPage} />
    </>
  );
}
