"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { Textarea } from "@/components/ui/Field";
import { POST_MAX_LENGTH } from "@/lib/constants";
import { absoluteTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useDeletePost, useToggleLike, useUpdatePost } from "@/hooks/usePosts";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Post } from "@/types";
import { PostContent } from "./PostContent";

export function PostCard({ post, asLink = true }: { post: Post; asLink?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  return (
    <article
      className={cn(
        "border-b border-line bg-surface px-4 py-4 transition-colors sm:px-5",
        asLink && "cursor-pointer hover:bg-surface-hover",
      )}
      onClick={
        asLink
          ? (event) => {
              // Не перехватываем клики по вложенным ссылкам и кнопкам —
              // иначе «лайк» открывал бы страницу поста.
              if ((event.target as HTMLElement).closest("a,button")) return;
              if (window.getSelection()?.toString()) return;
              router.push(`/post/${post.id}`);
            }
          : undefined
      }
    >
      <div className="flex gap-3">
        <Link href={`/u/${post.author.username}`} className="shrink-0">
          <Avatar displayName={post.author.displayName} avatarColor={post.author.avatarColor} />
        </Link>

        <div className="min-w-0 flex-1">
          <PostHeader post={post} onEdit={() => setEditing(true)} />

          {editing ? (
            <PostEditor post={post} onDone={() => setEditing(false)} />
          ) : (
            <div className="mt-1">
              <PostContent text={post.content} />
            </div>
          )}

          {!editing && <PostActions post={post} />}
        </div>
      </div>
    </article>
  );
}

function PostHeader({ post, onEdit }: { post: Post; onEdit: () => void }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <Link
        href={`/u/${post.author.username}`}
        className="truncate font-bold hover:underline"
        title={post.author.displayName}
      >
        {post.author.displayName}
      </Link>
      <Link
        href={`/u/${post.author.username}`}
        className="truncate text-[14px] text-ink-muted hover:underline"
      >
        @{post.author.username}
      </Link>
      <span className="text-ink-faint" aria-hidden="true">
        ·
      </span>
      <time
        dateTime={post.createdAt}
        title={absoluteTime(post.createdAt)}
        className="shrink-0 text-[14px] text-ink-muted"
      >
        {relativeTime(post.createdAt)}
      </time>
      {post.editedAt && (
        <span className="shrink-0 text-[13px] text-ink-faint" title={absoluteTime(post.editedAt)}>
          (изменён)
        </span>
      )}

      {post.isMine && (
        <div className="ml-auto">
          <PostMenu post={post} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
}

function PostMenu({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const deletePost = useDeletePost();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <Menu
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Действия с постом"
          className="-m-1.5 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <MoreHorizontal className="size-4.5" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <MenuItem
            icon={Pencil}
            onClick={() => {
              close();
              onEdit();
            }}
          >
            Редактировать
          </MenuItem>
          <MenuItem
            icon={Trash2}
            danger
            onClick={() => {
              close();
              if (!window.confirm("Удалить пост? Это действие необратимо.")) return;

              deletePost.mutate(post.id, {
                onSuccess: () => {
                  toast("Пост удалён", "success");
                  // Со страницы удалённого поста нужно уйти — иначе она
                  // тут же покажет 404.
                  if (window.location.pathname === `/post/${post.id}`) router.push("/");
                },
                onError: (error) => toast(error.message, "error"),
              });
            }}
          >
            Удалить
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

function PostEditor({ post, onDone }: { post: Post; onDone: () => void }) {
  const [content, setContent] = useState(post.content);
  const updatePost = useUpdatePost();
  const { toast } = useToast();

  const trimmed = content.trim();
  const unchanged = trimmed === post.content;
  const tooLong = trimmed.length > POST_MAX_LENGTH;

  return (
    <div className="mt-2 space-y-2">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        autoFocus
        aria-label="Текст поста"
      />
      <div className="flex items-center justify-end gap-2">
        <span className={cn("mr-auto text-[13px]", tooLong ? "text-danger" : "text-ink-faint")}>
          {trimmed.length} / {POST_MAX_LENGTH}
        </span>
        <Button variant="ghost" size="sm" onClick={onDone}>
          Отмена
        </Button>
        <Button
          size="sm"
          loading={updatePost.isPending}
          disabled={trimmed.length === 0 || tooLong || unchanged}
          onClick={() =>
            updatePost.mutate(
              { postId: post.id, content: trimmed },
              {
                onSuccess: () => {
                  toast("Пост обновлён", "success");
                  onDone();
                },
                onError: (error) => toast(error.message, "error"),
              },
            )
          }
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
}

function PostActions({ post }: { post: Post }) {
  return (
    <div className="mt-3 flex items-center gap-1">
      <LikeButton post={post} />

      <Link
        href={`/post/${post.id}`}
        aria-label={`Комментарии: ${post.commentsCount}`}
        className="group flex items-center gap-1.5 rounded-full px-2 py-1.5 text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <MessageCircle className="size-[18px]" />
        {post.commentsCount > 0 && (
          <span className="text-[13px] font-semibold tabular-nums">{post.commentsCount}</span>
        )}
      </Link>
    </div>
  );
}

function LikeButton({ post }: { post: Post }) {
  const user = useCurrentUser();
  const toggleLike = useToggleLike();
  const { toast } = useToast();

  return (
    <button
      type="button"
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? "Убрать лайк" : "Поставить лайк"}
      onClick={() => {
        if (!user) {
          toast("Войдите, чтобы ставить лайки", "info");
          return;
        }
        toggleLike.mutate({ postId: post.id, liked: post.likedByMe });
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors",
        post.likedByMe ? "text-like" : "text-ink-muted hover:bg-like-soft hover:text-like",
      )}
    >
      <Heart
        className={cn("size-[18px]", post.likedByMe && "animate-like-burst fill-current")}
      />
      {post.likesCount > 0 && (
        <span className="text-[13px] font-semibold tabular-nums">{post.likesCount}</span>
      )}
    </button>
  );
}
