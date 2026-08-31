"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { joinedAt, plural, FOLLOWERS_FORMS, POSTS_FORMS } from "@/lib/format";
import { useProfile, useToggleFollow } from "@/hooks/useSocial";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";
import type { UserProfile } from "@/types";

export function ProfileHeader({ initialProfile }: { initialProfile: UserProfile }) {
  const { data: profile } = useProfile(initialProfile.username, initialProfile);
  const user = useCurrentUser();
  const toggleFollow = useToggleFollow(initialProfile.username);
  const { toast } = useToast();

  if (!profile) return null;

  return (
    <header className="border-b border-line bg-surface px-4 py-5 sm:px-5">
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
            </div>

            {profile.isMe ? (
              <Link
                href="/settings"
                className="flex h-9 shrink-0 items-center rounded-full border border-line-strong px-4 text-sm font-semibold transition-colors hover:bg-surface-hover"
              >
                Изменить профиль
              </Link>
            ) : (
              <Button
                size="sm"
                variant={profile.isFollowedByMe ? "secondary" : "primary"}
                className="shrink-0"
                onClick={() => {
                  if (!user) {
                    toast("Войдите, чтобы подписываться", "info");
                    return;
                  }
                  toggleFollow.mutate(profile.isFollowedByMe, {
                    onError: (error) => toast(error.message, "error"),
                  });
                }}
              >
                {profile.isFollowedByMe ? "Вы подписаны" : "Подписаться"}
              </Button>
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
          href={`/u/${profile.username}/followers`}
          className="text-ink-muted transition-colors hover:text-ink hover:underline"
        >
          <b className="font-bold text-ink">{profile.followersCount}</b>{" "}
          {plural(profile.followersCount, FOLLOWERS_FORMS)}
        </Link>
        <Link
          href={`/u/${profile.username}/following`}
          className="text-ink-muted transition-colors hover:text-ink hover:underline"
        >
          <b className="font-bold text-ink">{profile.followingCount}</b>{" "}
          {plural(profile.followingCount, ["подписка", "подписки", "подписок"])}
        </Link>
      </div>
    </header>
  );
}
