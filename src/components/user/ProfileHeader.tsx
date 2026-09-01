"use client";

import Link from "next/link";
import { CalendarDays, Check, MessageSquare, UserCheck, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { joinedAt, plural, POSTS_FORMS } from "@/lib/format";
import {
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useProfile,
  useRemoveFriendConnection,
  useSendFriendRequest,
} from "@/hooks/useSocial";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";
import type { UserProfile } from "@/types";

export function ProfileHeader({ initialProfile }: { initialProfile: UserProfile }) {
  const { data: profile } = useProfile(initialProfile.username, initialProfile);

  if (!profile) return null;

  return (
    <header className="rounded-2xl border border-line bg-surface px-4 py-5 shadow-card sm:px-6 sm:py-6">
      <div className="flex items-start gap-4">
        <Avatar
          displayName={profile.displayName}
          avatarColor={profile.avatarColor}
          size="xl"
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl leading-tight">{profile.displayName}</h1>
              <p className="truncate text-[15px] text-ink-muted">@{profile.username}</p>
              {/* Статус — отдельной строкой под ником, курсивом: это подпись
                  «чем я сейчас занят», а не часть имени и не описание профиля. */}
              {profile.status && (
                <p className="mt-1 truncate text-[14px] italic text-ink-muted">{profile.status}</p>
              )}
            </div>

            {profile.isMe ? (
              <Link
                href="/settings"
                className="flex h-9 shrink-0 items-center rounded-full border border-line-strong px-4 text-sm font-semibold transition-colors hover:bg-surface-hover"
              >
                Изменить профиль
              </Link>
            ) : (
              <FriendActions profile={profile} />
            )}
          </div>

          {profile.bio && (
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{profile.bio}</p>
          )}

          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-muted">
            <CalendarDays className="size-3.5" />
            {/* «в июле 2026» — падеж требует предлога отдельно от формата даты. */}С нами с{" "}
            {joinedAt(profile.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
        <span className="text-ink-muted">
          <b className="font-bold text-ink">{profile.postsCount}</b>{" "}
          {plural(profile.postsCount, POSTS_FORMS)}
        </span>
        <Link
          href={`/u/${profile.username}/friends`}
          className="text-ink-muted transition-colors hover:text-ink hover:underline"
        >
          <b className="font-bold text-ink">{profile.friendsCount}</b>{" "}
          {plural(profile.friendsCount, ["друг", "друга", "друзей"])}
        </Link>
      </div>
    </header>
  );
}

/**
 * Кнопка отношений с четырьмя состояниями. Каждое показывает и текущее
 * положение дел, и следующее возможное действие — «В друзьях» при наведении
 * не превращается в «Удалить», потому что подмена подписи под курсором
 * приводит к случайным разрывам дружбы.
 */
function FriendActions({ profile }: { profile: UserProfile }) {
  const user = useCurrentUser();
  const { toast } = useToast();

  const sendRequest = useSendFriendRequest(profile.username);
  const removeConnection = useRemoveFriendConnection(profile.username);
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();

  const onError = (error: Error) => toast(error.message, "error");
  const requireAuth = () => {
    if (user) return true;
    toast("Войдите, чтобы добавлять в друзья", "info");
    return false;
  };

  if (profile.friendStatus === "friends") {
    return (
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/messages/${profile.username}`}
          className="flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          <MessageSquare className="size-4" />
          Написать
        </Link>
        <Button
          size="sm"
          variant="secondary"
          loading={removeConnection.isPending}
          onClick={() => removeConnection.mutate(undefined, { onError })}
        >
          <UserCheck className="size-4" />
          В друзьях
        </Button>
      </div>
    );
  }

  if (profile.friendStatus === "incoming") {
    return (
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          loading={accept.isPending}
          onClick={() => accept.mutate(profile.username, { onError })}
        >
          <Check className="size-4" />
          Принять
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={decline.isPending}
          onClick={() => decline.mutate(profile.username, { onError })}
        >
          <X className="size-4" />
          Отклонить
        </Button>
      </div>
    );
  }

  if (profile.friendStatus === "outgoing") {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="shrink-0"
        loading={removeConnection.isPending}
        onClick={() => removeConnection.mutate(undefined, { onError })}
      >
        Заявка отправлена
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="shrink-0"
      loading={sendRequest.isPending}
      onClick={() => {
        if (!requireAuth()) return;
        sendRequest.mutate(undefined, { onError });
      }}
    >
      <UserPlus className="size-4" />
      Добавить в друзья
    </Button>
  );
}
