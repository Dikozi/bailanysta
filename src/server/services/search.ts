import { prisma } from "@/server/db";
import type { SearchResults } from "@/types";
import { listPosts } from "./posts";
import { userSummarySelect } from "./selects";

const USERS_LIMIT = 6;
const HASHTAGS_LIMIT = 6;
const POSTS_LIMIT = 20;

/**
 * Поиск идёт по трём сущностям сразу и опирается на GIN-индексы pg_trgm.
 *
 * Триграммы, а не полнотекстовый tsvector: у нас контент на русском, казахском
 * и английском вперемешку, и один языковой словарь Postgres обслужил бы только
 * один из них. Триграммы языконезависимы и вдобавок находят по части слова —
 * для строки поиска это ближе к ожиданиям пользователя, чем поиск по стемам.
 */
export async function search(query: string, viewerId: string | null): Promise<SearchResults> {
  // «#almaty» и «almaty» должны находить одно и то же.
  const bare = query.replace(/^#/, "");

  const [posts, users, hashtags] = await Promise.all([
    listPosts({ q: query, limit: POSTS_LIMIT, feed: "global" }, viewerId),

    prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: bare, mode: "insensitive" } },
          { username: { contains: bare, mode: "insensitive" } },
        ],
      },
      orderBy: { followers: { _count: "desc" } },
      take: USERS_LIMIT,
      select: userSummarySelect,
    }),

    prisma.hashtag.findMany({
      where: { tag: { contains: bare.toLowerCase() } },
      orderBy: { posts: { _count: "desc" } },
      take: HASHTAGS_LIMIT,
      select: { tag: true, _count: { select: { posts: true } } },
    }),
  ]);

  return {
    posts: posts.items,
    users,
    hashtags: hashtags.map((row) => ({ tag: row.tag, postsCount: row._count.posts })),
  };
}
