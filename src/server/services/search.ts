import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import type { Post, SearchResults } from "@/types";
import { postSelect, toPostDTO, userSummarySelect } from "./selects";

const USERS_LIMIT = 6;
const HASHTAGS_LIMIT = 6;
const POSTS_LIMIT = 20;

/**
 * Экранирует спецсимволы LIKE/ILIKE (%, _, \), чтобы поиск строки «100%»
 * не превращался в шаблон «содержит сто, затем что угодно».
 */
function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Посты для поиска — отдельно от общей ленты, потому что здесь важен порядок
 * по релевантности, а не по времени.
 *
 * `similarity()` из pg_trgm сравнивает пост целиком со строкой запроса:
 * короткий пост, где искомое слово — почти всё содержание, получает более
 * высокий балл, чем длинный пост, где оно упомянуто мельком. WHERE остаётся
 * тем же ILIKE-условием, что было раньше, — набор найденных постов не меняется,
 * меняется только порядок внутри него.
 */
async function searchPostsByRelevance(query: string, viewerId: string | null): Promise<Post[]> {
  const pattern = `%${escapeLikePattern(query)}%`;

  const ranked = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT id FROM "Post"
    WHERE content ILIKE ${pattern}
    ORDER BY similarity(lower(content), lower(${query})) DESC, "createdAt" DESC
    LIMIT ${POSTS_LIMIT}
  `);

  if (ranked.length === 0) return [];

  const ids = ranked.map((row) => row.id);
  const rows = await prisma.post.findMany({
    where: { id: { in: ids } },
    select: postSelect(viewerId),
  });

  // findMany с `id: { in }` не гарантирует порядок строк — восстанавливаем
  // ранжирование из первого запроса.
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is (typeof rows)[number] => row !== undefined)
    .map((row) => toPostDTO(row, viewerId));
}

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
    searchPostsByRelevance(query, viewerId),

    prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: bare, mode: "insensitive" } },
          { username: { contains: bare, mode: "insensitive" } },
        ],
      },
      // Число подписчиков ушло вместе с Follow — используем число постов
      // как ближайший по духу сигнал «этот человек тут активен».
      orderBy: { posts: { _count: "desc" } },
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
    posts,
    users,
    hashtags: hashtags.map((row) => ({ tag: row.tag, postsCount: row._count.posts })),
  };
}
