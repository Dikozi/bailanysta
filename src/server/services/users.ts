import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { UpdateProfileInput } from "@/lib/validation";
import type { CurrentUser, FriendStatus, UserProfile, UserSummary } from "@/types";
import { userSummarySelect } from "./selects";

/**
 * Отношение зрителя с профилем определяется по существующим строкам
 * FriendRequest между двумя id — без похода в отдельную таблицу «дружба»,
 * которой в схеме нет: дружба выводится, а не хранится напрямую.
 */
function resolveFriendStatus(
  viewerId: string | null,
  profileId: string,
  /** Заявка, которую отправил зритель владельцу профиля. */
  outgoing: { status: "PENDING" | "ACCEPTED" } | null,
  /** Заявка, которую владелец профиля отправил зрителю. */
  incoming: { status: "PENDING" | "ACCEPTED" } | null,
): FriendStatus {
  if (!viewerId || viewerId === profileId) return "none";
  if (outgoing?.status === "ACCEPTED" || incoming?.status === "ACCEPTED") return "friends";
  if (outgoing?.status === "PENDING") return "outgoing";
  if (incoming?.status === "PENDING") return "incoming";
  return "none";
}

export async function getProfile(
  username: string,
  viewerId: string | null,
): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarColor: true,
      bio: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          // Друг — это ACCEPTED-строка с любой стороны, поэтому считаем
          // обе релевантные связи и складываем суммы после запроса.
          sentFriendRequests: { where: { status: "ACCEPTED" } },
          friendRequestsToMe: { where: { status: "ACCEPTED" } },
        },
      },
      // Две стороны отношения — я мог написать ему, а он мог написать мне.
      // Обе выбираются одной строкой по уникальному индексу (senderId, receiverId).
      sentFriendRequests: viewerId
        ? { where: { receiverId: viewerId }, select: { status: true }, take: 1 }
        : false,
      friendRequestsToMe: viewerId
        ? { where: { senderId: viewerId }, select: { status: true }, take: 1 }
        : false,
    },
  });

  if (!user) throw errors.notFound("Пользователь не найден");

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarColor: user.avatarColor,
    bio: user.bio,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    postsCount: user._count.posts,
    friendsCount: user._count.sentFriendRequests + user._count.friendRequestsToMe,
    friendStatus: resolveFriendStatus(
      viewerId,
      user.id,
      // Направления считаются с точки зрения ЗРИТЕЛЯ, а не владельца профиля:
      // строки, отправленные владельцем зрителю (sentFriendRequests), для
      // зрителя входящие, и наоборот. Перепутать их местами легко, и тогда
      // получателю заявки показывалась бы кнопка «Заявка отправлена»
      // вместо «Принять».
      user.friendRequestsToMe?.[0] ?? null,
      user.sentFriendRequests?.[0] ?? null,
    ),
    isMe: viewerId === user.id,
  };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<CurrentUser> {
  return prisma.user.update({
    where: { id: userId },
    data: { displayName: input.displayName, bio: input.bio, status: input.status },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarColor: true,
      bio: true,
      status: true,
    },
  });
}

/**
 * Авторы для верхнего ряда ленты.
 *
 * Сортировка по числу постов, а не по подписчикам: ряд должен вести туда,
 * где есть что читать. Пользователи без единого поста отсекаются — пустой
 * профиль за красивым аватаром обманывает ожидание.
 */
export async function getActiveAuthors(limit = 12): Promise<UserSummary[]> {
  const rows = await prisma.user.findMany({
    where: { posts: { some: {} } },
    orderBy: { posts: { _count: "desc" } },
    take: limit,
    select: userSummarySelect,
  });

  return rows;
}

/** Сводные числа для титульного экрана. */
export async function getPublicStats() {
  const [authors, posts, hashtags] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.hashtag.count(),
  ]);

  return { authors, posts, hashtags };
}
