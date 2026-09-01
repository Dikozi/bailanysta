import { Prisma } from "@/generated/prisma/client";
import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { FeedQuery } from "@/lib/validation";
import type { Page, Post } from "@/types";
import { syncPostHashtags } from "./hashtags";
import { postSelect, toPostDTO } from "./selects";

/**
 * Одна функция обслуживает все списки постов: глобальную ленту, ленту подписок,
 * профиль, страницу хэштега и поиск. Различаются они только фильтром —
 * дублировать пагинацию и маппинг под каждый случай смысла нет.
 */
export async function listPosts(
  query: FeedQuery,
  viewerId: string | null,
): Promise<Page<Post>> {
  const filters: Prisma.PostWhereInput[] = [];

  if (query.feed === "friends") {
    if (!viewerId) return { items: [], nextCursor: null };
    // Лента друзей = посты тех, с кем есть принятая дружба, плюс собственные:
    // пустая лента у нового пользователя выглядела бы поломкой.
    filters.push({
      OR: [
        { authorId: viewerId },
        {
          author: {
            OR: [
              { sentFriendRequests: { some: { receiverId: viewerId, status: "ACCEPTED" } } },
              { friendRequestsToMe: { some: { senderId: viewerId, status: "ACCEPTED" } } },
            ],
          },
        },
      ],
    });
  }

  if (query.authorId) filters.push({ authorId: query.authorId });
  if (query.tag) filters.push({ hashtags: { some: { hashtag: { tag: query.tag } } } });
  if (query.q) filters.push({ content: { contains: query.q, mode: "insensitive" } });

  // Keyset: «строго раньше» по времени, а при равном времени — по убыванию id.
  const cursor = decodeCursor(query.cursor);
  if (cursor) {
    filters.push({
      OR: [
        { createdAt: { lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, id: { lt: cursor.id } },
      ],
    });
  }

  // Берём на один больше запрошенного: лишний элемент — признак того,
  // что следующая страница существует, без отдельного COUNT.
  const rows = await prisma.post.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.limit + 1,
    select: postSelect(viewerId),
  });

  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;
  const last = page.at(-1);

  return {
    items: page.map((row) => toPostDTO(row, viewerId)),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  };
}

export async function getPost(postId: string, viewerId: string | null): Promise<Post> {
  const row = await prisma.post.findUnique({
    where: { id: postId },
    select: postSelect(viewerId),
  });
  if (!row) throw errors.notFound("Пост не найден");
  return toPostDTO(row, viewerId);
}

export async function createPost(authorId: string, content: string): Promise<Post> {
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: { authorId, content },
      select: { id: true },
    });
    await syncPostHashtags(tx, created.id, content);
    return tx.post.findUniqueOrThrow({
      where: { id: created.id },
      select: postSelect(authorId),
    });
  });

  return toPostDTO(row, authorId);
}

export async function updatePost(
  postId: string,
  authorId: string,
  content: string,
): Promise<Post> {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!existing) throw errors.notFound("Пост не найден");
  if (existing.authorId !== authorId) throw errors.forbidden("Это не ваш пост");

  const row = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      // editedAt отличает «отредактирован» от «просто пересохранён»: updatedAt
      // меняется и от служебных апдейтов счётчиков, а метка правки — нет.
      data: { content, editedAt: new Date() },
    });
    await syncPostHashtags(tx, postId, content);
    return tx.post.findUniqueOrThrow({ where: { id: postId }, select: postSelect(authorId) });
  });

  return toPostDTO(row, authorId);
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!existing) throw errors.notFound("Пост не найден");
  if (existing.authorId !== authorId) throw errors.forbidden("Это не ваш пост");

  // Лайки, комментарии, связи с тегами и уведомления уходят каскадом (onDelete: Cascade).
  await prisma.post.delete({ where: { id: postId } });
}
