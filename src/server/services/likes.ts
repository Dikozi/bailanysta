import { prisma } from "@/server/db";
import { errors } from "@/server/http";

export type LikeResult = { likesCount: number; likedByMe: boolean };

/**
 * Лайк и снятие лайка идемпотентны: повторный вызов не ломает счётчик.
 * Это важно, потому что клиент делает оптимистичное обновление и может
 * отправить запрос дважды при быстром двойном клике или ретрае сети.
 *
 * Уникальный индекс (userId, postId) — единственный настоящий арбитр:
 * даже при гонке двух параллельных запросов вставка пройдёт ровно одна.
 */
export async function likePost(postId: string, userId: string): Promise<LikeResult> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw errors.notFound("Пост не найден");

  const likesCount = await prisma.$transaction(async (tx) => {
    const inserted = await tx.like.createMany({
      data: { userId, postId },
      skipDuplicates: true,
    });

    if (inserted.count === 0) {
      const current = await tx.post.findUniqueOrThrow({
        where: { id: postId },
        select: { likesCount: true },
      });
      return current.likesCount;
    }

    const updated = await tx.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    });

    // Себе уведомления не шлём.
    if (post.authorId !== userId) {
      await tx.notification.create({
        data: { recipientId: post.authorId, actorId: userId, type: "LIKE", postId },
      });
    }

    return updated.likesCount;
  });

  return { likesCount, likedByMe: true };
}

export async function unlikePost(postId: string, userId: string): Promise<LikeResult> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw errors.notFound("Пост не найден");

  const likesCount = await prisma.$transaction(async (tx) => {
    const removed = await tx.like.deleteMany({ where: { userId, postId } });

    if (removed.count === 0) {
      const current = await tx.post.findUniqueOrThrow({
        where: { id: postId },
        select: { likesCount: true },
      });
      return current.likesCount;
    }

    const updated = await tx.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
      select: { likesCount: true },
    });

    // Снятый лайк не должен оставлять после себя уведомление «вас лайкнули».
    await tx.notification.deleteMany({
      where: { recipientId: post.authorId, actorId: userId, type: "LIKE", postId },
    });

    return updated.likesCount;
  });

  return { likesCount, likedByMe: false };
}
