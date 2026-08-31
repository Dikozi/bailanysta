import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { Page, UserSummary } from "@/types";
import { userSummarySelect } from "./selects";

export type FollowResult = { isFollowedByMe: boolean; followersCount: number };

async function findUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) throw errors.notFound("Пользователь не найден");
  return user;
}

export async function followUser(followerId: string, username: string): Promise<FollowResult> {
  const target = await findUserByUsername(username);
  if (target.id === followerId) throw errors.badRequest("Нельзя подписаться на себя");

  const followersCount = await prisma.$transaction(async (tx) => {
    const inserted = await tx.follow.createMany({
      data: { followerId, followingId: target.id },
      skipDuplicates: true,
    });

    if (inserted.count > 0) {
      await tx.notification.create({
        data: { recipientId: target.id, actorId: followerId, type: "FOLLOW" },
      });
    }

    return tx.follow.count({ where: { followingId: target.id } });
  });

  return { isFollowedByMe: true, followersCount };
}

export async function unfollowUser(followerId: string, username: string): Promise<FollowResult> {
  const target = await findUserByUsername(username);

  const followersCount = await prisma.$transaction(async (tx) => {
    const removed = await tx.follow.deleteMany({
      where: { followerId, followingId: target.id },
    });

    if (removed.count > 0) {
      await tx.notification.deleteMany({
        where: { recipientId: target.id, actorId: followerId, type: "FOLLOW" },
      });
    }

    return tx.follow.count({ where: { followingId: target.id } });
  });

  return { isFollowedByMe: false, followersCount };
}

/**
 * Списки подписчиков и подписок отличаются только тем, какую сторону связи
 * фиксируем и чью карточку возвращаем — логика пагинации общая.
 */
async function listRelated(
  username: string,
  direction: "followers" | "following",
  options: { cursor?: string; limit: number },
): Promise<Page<UserSummary>> {
  const target = await findUserByUsername(username);
  const cursor = decodeCursor(options.cursor);

  const where =
    direction === "followers" ? { followingId: target.id } : { followerId: target.id };

  // Ключ пагинации — пара (createdAt, id второго участника связи).
  // Одного времени мало: две подписки, созданные в одну миллисекунду,
  // не имели бы устойчивого порядка, и на границе страниц одна из них терялась.
  const tieBreaker = direction === "followers" ? "followerId" : "followingId";

  const rows = await prisma.follow.findMany({
    where: {
      ...where,
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, [tieBreaker]: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { [tieBreaker]: "desc" }],
    take: options.limit + 1,
    // Тянем обе стороны связи вместо условного select: лишний join на строку
    // ничего не стоит, зато типы остаются статическими, без union-ов.
    select: {
      createdAt: true,
      follower: { select: userSummarySelect },
      following: { select: userSummarySelect },
    },
  });

  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const items = page.map((row) => (direction === "followers" ? row.follower : row.following));
  const last = page.at(-1);
  const lastId = items.at(-1)?.id;

  return {
    items,
    nextCursor:
      hasMore && last && lastId
        ? encodeCursor({ createdAt: last.createdAt, id: lastId })
        : null,
  };
}

export function listFollowers(username: string, options: { cursor?: string; limit: number }) {
  return listRelated(username, "followers", options);
}

export function listFollowing(username: string, options: { cursor?: string; limit: number }) {
  return listRelated(username, "following", options);
}
