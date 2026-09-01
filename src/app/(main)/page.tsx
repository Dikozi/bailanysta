import { AuthorsRail } from "@/components/feed/AuthorsRail";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { GuestHero } from "@/components/landing/GuestHero";
import { PostComposer } from "@/components/post/PostComposer";
import { getCurrentUser } from "@/server/auth/session";
import { listPosts } from "@/server/services/posts";
import { getPublicStats } from "@/server/services/users";
import { PAGE_SIZE } from "@/lib/constants";

// Лента зависит от того, кто смотрит (лайки, «мой пост»), поэтому
// кешировать её на уровне маршрута нельзя.
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const viewer = await getCurrentUser();

  // Первую страницу берём напрямую из сервиса, без похода в собственный HTTP:
  // это тот же код, что и в /api/v1/posts, но без лишнего сетевого прыжка.
  const [initialPage, stats] = await Promise.all([
    listPosts({ feed: "global", limit: PAGE_SIZE }, viewer?.id ?? null),
    // Цифры нужны только гостю — для остальных запрос не делаем.
    viewer ? Promise.resolve(null) : getPublicStats(),
  ]);

  return (
    <div className="space-y-3 pt-0 lg:pt-3">
      {viewer ? (
        <>
          <AuthorsRail />
          <PostComposer />
        </>
      ) : (
        <>
          {stats && <GuestHero stats={stats} />}
          <AuthorsRail />
        </>
      )}

      <FeedTabs initialPage={initialPage} />
    </div>
  );
}
