import { Prisma } from "@/generated/prisma/client";
import { extractHashtags } from "@/lib/hashtags";
import { prisma } from "@/server/db";
import type { TrendingHashtag } from "@/types";

/**
 * Хэштеги хранятся отдельной таблицей, а не поиском по тексту:
 * страница тега и «в тренде» получаются обычным индексным запросом,
 * а не сканированием всех постов с LIKE '%#tag%'.
 */
export async function syncPostHashtags(
  tx: Prisma.TransactionClient,
  postId: string,
  content: string,
): Promise<void> {
  const tags = extractHashtags(content);

  // При редактировании старые связи снимаем целиком — их единицы, это дешевле дифа.
  await tx.postHashtag.deleteMany({ where: { postId } });
  if (tags.length === 0) return;

  await tx.hashtag.createMany({
    data: tags.map((tag) => ({ tag })),
    skipDuplicates: true,
  });

  const rows = await tx.hashtag.findMany({
    where: { tag: { in: tags } },
    select: { id: true },
  });

  await tx.postHashtag.createMany({
    data: rows.map((row) => ({ postId, hashtagId: row.id })),
    skipDuplicates: true,
  });
}

export async function getTrendingHashtags(limit = 8): Promise<TrendingHashtag[]> {
  const rows = await prisma.hashtag.findMany({
    select: {
      tag: true,
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: "desc" } },
    take: limit,
  });

  return rows
    .filter((row) => row._count.posts > 0)
    .map((row) => ({ tag: row.tag, postsCount: row._count.posts }));
}
