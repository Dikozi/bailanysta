"use client";

import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { useConversations } from "@/hooks/useMessages";

export function ConversationList() {
  const { data, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card"
          >
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Переписок пока нет"
        description="Переписка доступна с друзьями — найдите человека через поиск, добавьте в друзья и напишите первым."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((conversation) => (
        <Link
          key={conversation.peer.id}
          href={`/messages/${conversation.peer.username}`}
          className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-pop"
        >
          <Avatar
            displayName={conversation.peer.displayName}
            avatarColor={conversation.peer.avatarColor}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-bold">{conversation.peer.displayName}</span>
              <span className="shrink-0 text-[13px] text-ink-faint">
                {relativeTime(conversation.lastMessage.createdAt)}
              </span>
            </div>
            <p
              className={cn(
                "truncate text-[14px]",
                conversation.unreadCount > 0 ? "font-semibold text-ink" : "text-ink-muted",
              )}
            >
              {/* «Вы:» перед своим последним сообщением — иначе непонятно,
                  ждёт ли собеседник ответа или ответить должны вы. */}
              {conversation.lastMessage.isMine && (
                <span className="text-ink-faint">Вы: </span>
              )}
              {conversation.lastMessage.content}
            </p>
          </div>

          {conversation.unreadCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-ink">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
