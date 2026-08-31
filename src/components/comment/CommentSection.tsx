"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Field";
import { COMMENT_MAX_LENGTH } from "@/lib/constants";
import { absoluteTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useSocial";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Comment } from "@/types";

export function CommentSection({ postId }: { postId: string }) {
  return (
    <section aria-label="Комментарии">
      <CommentForm postId={postId} />
      <CommentList postId={postId} />
    </section>
  );
}

function CommentForm({ postId }: { postId: string }) {
  const user = useCurrentUser();
  const [content, setContent] = useState("");
  const createComment = useCreateComment(postId);
  const { toast } = useToast();

  if (!user) {
    return (
      <p className="border-b border-line bg-surface px-4 py-4 text-sm text-ink-muted sm:px-5">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Войдите
        </Link>
        , чтобы оставить комментарий.
      </p>
    );
  }

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH;

  return (
    <div className="border-b border-line bg-surface px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <Avatar displayName={user.displayName} avatarColor={user.avatarColor} size="sm" />
        <div className="min-w-0 flex-1">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Написать комментарий…"
            aria-label="Текст комментария"
            rows={2}
            className="border-0 bg-transparent px-0 focus:border-0"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            {trimmed.length > COMMENT_MAX_LENGTH - 50 && (
              <span
                className={cn(
                  "text-[13px] font-semibold tabular-nums",
                  trimmed.length > COMMENT_MAX_LENGTH ? "text-danger" : "text-ink-muted",
                )}
              >
                {COMMENT_MAX_LENGTH - trimmed.length}
              </span>
            )}
            <Button
              size="sm"
              disabled={!canSubmit}
              loading={createComment.isPending}
              onClick={() =>
                createComment.mutate(trimmed, {
                  onSuccess: () => setContent(""),
                  onError: (error) => toast(error.message, "error"),
                })
              }
            >
              Отправить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentList({ postId }: { postId: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useComments(postId);

  if (isLoading) {
    return (
      <div aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3 border-b border-line px-4 py-3.5 sm:px-5">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const comments = data?.pages.flatMap((page) => page.items) ?? [];

  if (comments.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-ink-muted">
        Комментариев пока нет. Будьте первым.
      </p>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-5">
          <Button
            variant="secondary"
            size="sm"
            loading={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            Показать ещё комментарии
          </Button>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, postId }: { comment: Comment; postId: string }) {
  const deleteComment = useDeleteComment(postId);
  const { toast } = useToast();

  return (
    <article className="group flex gap-3 border-b border-line bg-surface px-4 py-3.5 sm:px-5">
      <Link href={`/u/${comment.author.username}`} className="shrink-0">
        <Avatar
          displayName={comment.author.displayName}
          avatarColor={comment.author.avatarColor}
          size="sm"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <Link href={`/u/${comment.author.username}`} className="truncate font-bold hover:underline">
            {comment.author.displayName}
          </Link>
          <span className="truncate text-[13px] text-ink-muted">@{comment.author.username}</span>
          <span className="text-ink-faint" aria-hidden="true">
            ·
          </span>
          <time
            dateTime={comment.createdAt}
            title={absoluteTime(comment.createdAt)}
            className="shrink-0 text-[13px] text-ink-muted"
          >
            {relativeTime(comment.createdAt)}
          </time>

          {/*
            Кнопка удаления показана всем, у кого есть право (автор комментария
            или автор поста), но проявляется только при наведении/фокусе,
            чтобы не засорять ленту обсуждения.
          */}
          {comment.canDelete && (
            <button
              type="button"
              aria-label="Удалить комментарий"
              onClick={() => {
                if (!window.confirm("Удалить комментарий?")) return;
                deleteComment.mutate(comment.id, {
                  onError: (error) => toast(error.message, "error"),
                });
              }}
              className="-m-1 ml-auto rounded-full p-1 text-ink-faint opacity-0 transition hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {comment.content}
        </p>
      </div>
    </article>
  );
}
