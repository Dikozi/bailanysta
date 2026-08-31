import { Prisma } from "@/generated/prisma/client";
import type { Comment, Notification, Post, UserSummary } from "@/types";

/**
 * Формы выборки объявлены один раз и переиспользуются во всех сервисах:
 * так наружу физически не может утечь passwordHash или email чужого пользователя.
 */

export const userSummarySelect = {
  id: true,
  username: true,
  displayName: true,
  avatarColor: true,
} satisfies Prisma.UserSelect;

/**
 * `likes` тянем ограниченным подзапросом на одну строку по уникальному индексу
 * (userId, postId) — это дешевле, чем отдельный запрос «какие посты я лайкнул»,
 * и не ломается при пагинации. Для гостя подставляем невозможный id.
 */
export function postSelect(viewerId: string | null) {
  return {
    id: true,
    content: true,
    createdAt: true,
    editedAt: true,
    likesCount: true,
    commentsCount: true,
    authorId: true,
    author: { select: userSummarySelect },
    hashtags: { select: { hashtag: { select: { tag: true } } } },
    likes: {
      where: { userId: viewerId ?? "" },
      select: { id: true },
      take: 1,
    },
  } satisfies Prisma.PostSelect;
}

export const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  authorId: true,
  author: { select: userSummarySelect },
} satisfies Prisma.CommentSelect;

export const notificationSelect = {
  id: true,
  type: true,
  isRead: true,
  createdAt: true,
  postId: true,
  actor: { select: userSummarySelect },
  post: { select: { content: true } },
  comment: { select: { content: true } },
} satisfies Prisma.NotificationSelect;

type PostRow = Prisma.PostGetPayload<{ select: ReturnType<typeof postSelect> }>;
type CommentRow = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;
type NotificationRow = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>;

export function toPostDTO(row: PostRow, viewerId: string | null): Post {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    editedAt: row.editedAt?.toISOString() ?? null,
    author: row.author satisfies UserSummary,
    likesCount: row.likesCount,
    commentsCount: row.commentsCount,
    likedByMe: row.likes.length > 0,
    isMine: viewerId !== null && row.authorId === viewerId,
    hashtags: row.hashtags.map((link) => link.hashtag.tag),
  };
}

export function toCommentDTO(row: CommentRow, viewerId: string | null): Comment {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    author: row.author,
    isMine: viewerId !== null && row.authorId === viewerId,
  };
}

const PREVIEW_LENGTH = 90;

function preview(text: string | undefined): string | null {
  if (!text) return null;
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…` : text;
}

export function toNotificationDTO(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    actor: row.actor,
    postId: row.postId,
    // Для комментария показываем сам комментарий, для лайка — текст поста.
    preview: preview(row.comment?.content ?? row.post?.content),
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}
