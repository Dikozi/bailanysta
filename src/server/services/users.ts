import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { UpdateProfileInput } from "@/lib/validation";
import type { CurrentUser, UserProfile } from "@/types";

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
      createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
      // Одна строка по индексу вместо отдельного запроса «подписан ли я».
      followers: viewerId
        ? { where: { followerId: viewerId }, select: { followerId: true }, take: 1 }
        : { where: { followerId: "" }, select: { followerId: true }, take: 0 },
    },
  });

  if (!user) throw errors.notFound("Пользователь не найден");

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarColor: user.avatarColor,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    postsCount: user._count.posts,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowedByMe: user.followers.length > 0,
    isMe: viewerId === user.id,
  };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<CurrentUser> {
  return prisma.user.update({
    where: { id: userId },
    data: { displayName: input.displayName, bio: input.bio },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarColor: true,
      bio: true,
    },
  });
}
