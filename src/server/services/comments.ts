import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { Comment, Page } from "@/types";
import { commentSelect, toCommentDTO } from "./selects";

/** Комментарии читаются сверху вниз, поэтому порядок — по возрастанию времени. */
export async function listComments(
  postId: string,
  viewerId: string | null,
  options: { cursor?: string; limit: number },
): Promise<Page<Comment>> {
  // Автора поста запрашиваем один раз, а не join'ом на каждый комментарий.
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw errors.notFound("Пост не найден");

  const cursor = decodeCursor(options.cursor);

  const rows = await prisma.comment.findMany({
    where: {
      postId,
      ...(cursor
        ? {
            OR: [
              { createdAt: { gt: cursor.createdAt } },
              { createdAt: cursor.createdAt, id: { gt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: options.limit + 1,
    select: commentSelect,
  });

  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const last = page.at(-1);

  return {
    items: page.map((row) => toCommentDTO(row, viewerId, post.authorId)),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  };
}

export type CreateCommentResult = { comment: Comment; commentsCount: number };

export async function createComment(
  postId: string,
  authorId: string,
  content: string,
): Promise<CreateCommentResult> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw errors.notFound("Пост не найден");

  return prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: { postId, authorId, content },
      select: commentSelect,
    });

    const updated = await tx.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
      select: { commentsCount: true },
    });

    if (post.authorId !== authorId) {
      await tx.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: authorId,
          type: "COMMENT",
          postId,
          commentId: created.id,
        },
      });
    }

    return {
      comment: toCommentDTO(created, authorId, post.authorId),
      commentsCount: updated.commentsCount,
    };
  });
}

/** Удалить комментарий может его автор — и автор поста, как хозяин обсуждения. */
export async function deleteComment(commentId: string, userId: string): Promise<number> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true, post: { select: { authorId: true } } },
  });
  if (!comment) throw errors.notFound("Комментарий не найден");

  const canDelete = comment.authorId === userId || comment.post.authorId === userId;
  if (!canDelete) throw errors.forbidden("Нельзя удалить чужой комментарий");

  return prisma.$transaction(async (tx) => {
    await tx.comment.delete({ where: { id: commentId } });
    const updated = await tx.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
      select: { commentsCount: true },
    });
    return updated.commentsCount;
  });
}
