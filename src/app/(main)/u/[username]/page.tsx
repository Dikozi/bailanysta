import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfileHeader } from "@/components/user/ProfileHeader";
import { ProfileFeed } from "@/components/user/ProfileFeed";
import { PostComposer } from "@/components/post/PostComposer";
import { PAGE_SIZE } from "@/lib/constants";
import { AppError } from "@/server/http";
import { getSessionUserId } from "@/server/auth/session";
import { listPosts } from "@/server/services/posts";
import { getProfile } from "@/server/services/users";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  try {
    const profile = await getProfile(username.toLowerCase(), null);
    return {
      title: `${profile.displayName} (@${profile.username})`,
      description: profile.bio ?? `Профиль ${profile.displayName} в Bailanysta`,
    };
  } catch {
    return { title: "Профиль не найден" };
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const viewerId = await getSessionUserId();

  let profile;
  try {
    profile = await getProfile(username.toLowerCase(), viewerId);
  } catch (error) {
    // Сервис бросает доменную ошибку — превращаем её в честную 404-страницу.
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  const initialPage = await listPosts(
    { feed: "global", authorId: profile.id, limit: PAGE_SIZE },
    viewerId,
  );

  return (
    <div className="space-y-3 pt-0 lg:pt-3">
      <ProfileHeader initialProfile={profile} />

      {/*
        Форма создания поста на собственном профиле — прямое требование ТЗ:
        «страница профиля пользователя, где он может создавать посты».
        На чужом профиле её быть не должно, поэтому условие по isMe.
        Компонент самодостаточен: сам берёт пользователя из сессии и сам
        обновляет все ленты после публикации.
      */}
      {profile.isMe && <PostComposer />}

      <ProfileFeed
        authorId={profile.id}
        initialPage={initialPage}
        emptyState={
          <EmptyState
            icon={FileText}
            title={profile.isMe ? "У вас пока нет постов" : "Пока нет постов"}
            description={
              profile.isMe
                ? "Форма прямо над этим блоком — напишите первый пост, и он появится здесь."
                : `${profile.displayName} ещё ничего не публиковал.`
            }
          />
        }
      />
    </div>
  );
}
