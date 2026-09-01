"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Lock, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { MESSAGE_MAX_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { absoluteTime, relativeTime } from "@/lib/format";
import { useConversation, useMarkConversationRead, useSendMessage } from "@/hooks/useMessages";
import { useToast } from "@/providers/ToastProvider";
import type { UserProfile } from "@/types";

export function ChatView({ peer, canWrite }: { peer: UserProfile; canWrite: boolean }) {
  if (!canWrite) return <LockedNotice peer={peer} />;
  return <Chat username={peer.username} />;
}

/** Не друзья — объясняем причину и даём путь к решению, а не пустой экран. */
function LockedNotice({ peer }: { peer: UserProfile }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        <Lock className="size-5" />
      </span>
      <h2 className="font-display text-xl">Переписка доступна только друзьям</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Отправьте заявку в друзья на странице профиля. Как только её примут,
        здесь откроется переписка.
      </p>
      <Link
        href={`/u/${peer.username}`}
        className="mt-5 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        Открыть профиль
      </Link>
    </div>
  );
}

function Chat({ username }: { username: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConversation(username);
  const sendMessage = useSendMessage(username);
  const markRead = useMarkConversationRead(username);
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.pages.flatMap((page) => page.items) ?? [];
  const lastMessageId = messages.at(-1)?.id;

  // Прокрутка к последнему сообщению при появлении нового: в переписке
  // интересен конец списка, а не начало, в отличие от ленты.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [lastMessageId]);

  // Открыли переписку — значит, прочитали. Повторяем при каждом новом
  // сообщении: пользователь может держать чат открытым, пока ему пишут.
  useEffect(() => {
    if (messages.length > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageId]);

  const trimmed = content.trim();
  const tooLong = trimmed.length > MESSAGE_MAX_LENGTH;
  const canSubmit = trimmed.length > 0 && !tooLong && !sendMessage.isPending;

  const submit = () => {
    if (!canSubmit) return;
    sendMessage.mutate(trimmed, {
      onSuccess: () => setContent(""),
      onError: (error) => toast(error.message, "error"),
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        {isLoading ? (
          <div aria-busy="true" className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn("h-10 w-2/3 rounded-2xl", index % 2 === 1 && "ml-auto")}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            Сообщений пока нет. Напишите первым.
          </p>
        ) : (
          <div className="space-y-2">
            {hasNextPage && (
              <div className="flex justify-center pb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  Показать раньше
                </Button>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2",
                    message.isMine
                      ? "bg-accent text-accent-ink"
                      : "bg-surface-muted text-ink",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                    {message.content}
                  </p>
                  <time
                    dateTime={message.createdAt}
                    title={absoluteTime(message.createdAt)}
                    className={cn(
                      "mt-0.5 block text-[11px]",
                      message.isMine ? "text-accent-ink/70" : "text-ink-faint",
                    )}
                  >
                    {relativeTime(message.createdAt)}
                  </time>
                </div>
              </div>
            ))}

            <div ref={bottomRef} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-3 shadow-card">
        <div className="flex items-end gap-2">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            // Enter отправляет, Shift+Enter переносит строку — привычное
            // поведение мессенджера, где сообщения обычно однострочные.
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Написать сообщение…"
            aria-label="Текст сообщения"
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 border-0 bg-transparent px-0 focus:border-0"
          />
          <Button
            aria-label="Отправить"
            className="size-11 shrink-0 !px-0"
            loading={sendMessage.isPending}
            disabled={!canSubmit}
            onClick={submit}
          >
            {!sendMessage.isPending && <SendHorizontal className="size-4.5" />}
          </Button>
        </div>

        {tooLong && (
          <p className="mt-1 text-right text-[13px] text-danger">
            {MESSAGE_MAX_LENGTH - trimmed.length}
          </p>
        )}
      </div>
    </div>
  );
}
