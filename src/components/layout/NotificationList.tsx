"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Bell, Check, Heart, MessageCircle, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import {
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useMarkNotificationsRead,
  useNotifications,
} from "@/hooks/useSocial";
import { useToast } from "@/providers/ToastProvider";
import type { Notification, NotificationType } from "@/types";

const ICONS: Record<NotificationType, typeof Heart> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPTED: UserPlus,
};

const ICON_STYLES: Record<NotificationType, string> = {
  LIKE: "bg-like-soft text-like",
  COMMENT: "bg-accent-soft text-accent",
  FRIEND_REQUEST: "bg-surface-muted text-ink-muted",
  FRIEND_ACCEPTED: "bg-accent-soft text-accent",
};

/*
 * Формулировки намеренно без глаголов прошедшего времени.
 *
 * «Сабина прокомментировал» — рассогласование по роду, а рода пользователя
 * мы не знаем и спрашивать его ради подписи к уведомлению не хотим.
 * Отглагольные существительные снимают вопрос целиком.
 */
const EVENTS: Record<NotificationType, string> = {
  LIKE: "Новый лайк на вашем посте",
  COMMENT: "Новый комментарий к вашему посту",
  FRIEND_REQUEST: "Хочет добавить вас в друзья",
  FRIEND_ACCEPTED: "Принял(а) вашу заявку в друзья",
};

export function NotificationList() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotifications();
  const markRead = useMarkNotificationsRead();

  // Открыли экран — значит, прочитали. Отдельная кнопка «отметить всё»
  // здесь была бы лишней работой для пользователя.
  useEffect(() => {
    markRead.mutate();
    // Один раз при монтировании: повторный вызов на каждый ререндер не нужен.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex gap-3 border-b border-line px-4 py-4 sm:px-5">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Уведомлений пока нет"
        description="Здесь появятся лайки, комментарии и заявки в друзья."
      />
    );
  }

  return (
    <div>
      {items.map((item) => (
        <NotificationRow key={item.id} notification={item} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-6">
          <Button
            variant="secondary"
            size="sm"
            loading={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            Показать ещё
          </Button>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  const Icon = ICONS[notification.type];

  // Лайк и комментарий ведут к посту, заявка и её принятие — в профиль автора.
  const href = notification.postId
    ? `/post/${notification.postId}`
    : `/u/${notification.actor.username}`;

  return (
    <Link
      href={href}
      onClick={(event) => {
        // Кнопки «Принять/Отклонить» лежат внутри этой же кликабельной строки —
        // без остановки их нажатие ещё и уводило бы на профиль заявителя.
        if ((event.target as HTMLElement).closest("button")) event.preventDefault();
      }}
      className={cn(
        "flex gap-3 border-b border-line px-4 py-4 transition-colors hover:bg-surface-hover sm:px-5",
        // Непрочитанные подсвечены мягкой заливкой, а не жирным шрифтом:
        // так их видно, но список не выглядит рваным.
        notification.isRead ? "bg-surface" : "bg-accent-soft/40",
      )}
    >
      <span className="relative shrink-0">
        <Avatar
          displayName={notification.actor.displayName}
          avatarColor={notification.actor.avatarColor}
          size="sm"
        />
        <span
          className={cn(
            "absolute -bottom-1 -right-1 flex size-4.5 items-center justify-center rounded-full ring-2 ring-surface",
            ICON_STYLES[notification.type],
          )}
        >
          <Icon className="size-2.5" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1.5 text-[15px] leading-snug">
          <span className="truncate font-bold">{notification.actor.displayName}</span>
          <span className="shrink-0 text-[13px] text-ink-faint">
            · {relativeTime(notification.createdAt)}
          </span>
        </p>

        <p className="text-[14px] text-ink-muted">{EVENTS[notification.type]}</p>

        {notification.preview && (
          <p className="mt-1 truncate text-[14px] text-ink-faint">«{notification.preview}»</p>
        )}

        {notification.type === "FRIEND_REQUEST" && (
          <FriendRequestActions username={notification.actor.username} />
        )}
      </div>
    </Link>
  );
}

/**
 * Принять/отклонить прямо из уведомления — по требованию сценария
 * «второй видит заявку в уведомлениях». Отдельного экрана со списком
 * заявок нет: этот ряд и есть тот экран.
 */
function FriendRequestActions({ username }: { username: string }) {
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const { toast } = useToast();

  const pending = accept.isPending || decline.isPending;

  if (accept.isSuccess) {
    return <p className="mt-2 text-[13px] font-semibold text-accent">Заявка принята</p>;
  }
  if (decline.isSuccess) {
    return <p className="mt-2 text-[13px] text-ink-faint">Заявка отклонена</p>;
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button
        size="sm"
        loading={accept.isPending}
        disabled={pending}
        onClick={() => accept.mutate(username, { onError: (error) => toast(error.message, "error") })}
      >
        <Check className="size-4" />
        Принять
      </Button>
      <Button
        size="sm"
        variant="secondary"
        loading={decline.isPending}
        disabled={pending}
        onClick={() => decline.mutate(username, { onError: (error) => toast(error.message, "error") })}
      >
        <X className="size-4" />
        Отклонить
      </Button>
    </div>
  );
}
