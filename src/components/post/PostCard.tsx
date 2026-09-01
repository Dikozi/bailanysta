"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { Textarea } from "@/components/ui/Field";
import { POST_MAX_LENGTH } from "@/lib/constants";
import { absoluteTime, plural, relativeTime, COMMENTS_FORMS } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useDeletePost, useToggleLike, useUpdatePost } from "@/hooks/usePosts";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Post } from "@/types";
import { PostContent } from "./PostContent";

/**
 * Карточка поста — гибрид трёх сетей.
 *
 * Шапка плотная, как в Twitter: имя, ник и время в одну строку.
 * Оболочка и подвал — из Facebook: карточка с тенью, сводка вовлечённости
 * над разделителем и подписанные кнопки под ним. Лайк — из Instagram:
 * крупное сердце с «взрывом» и расходящимся кольцом.
 */
export function PostCard({
  post,
  asLink = true,
  variant = "feed",
}: {
  post: Post;
  asLink?: boolean;
  /**
   * "tile" — компактная плитка для сетки в профиле. Там все посты одного
   * автора, поэтому аватар и имя в каждой карточке были бы шумом, а подписи
   * на кнопках не помещаются в узкую колонку.
   */
  variant?: "feed" | "tile";
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const tile = variant === "tile";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-shadow duration-200",
        asLink && "cursor-pointer hover:shadow-pop",
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
      <div className={cn("flex gap-3 px-4 pt-4", !tile && "sm:px-5 sm:pt-5")}>
        {!tile && (
          <Link href={`/u/${post.author.username}`} className="shrink-0">
            <Avatar displayName={post.author.displayName} avatarColor={post.author.avatarColor} />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {tile ? (
            <TileHeader
              post={post}
              onEdit={() => setEditing(true)}
              onDelete={() => setConfirmingDelete(true)}
            />
          ) : (
            <PostHeader
              post={post}
              onEdit={() => setEditing(true)}
              onDelete={() => setConfirmingDelete(true)}
            />
          )}

          {editing ? (
            <PostEditor post={post} onDone={() => setEditing(false)} />
          ) : (
            <div className="mt-1.5">
              <PostContent text={post.content} />
            </div>
          )}
        </div>
      </div>

      {!editing && <PostFooter post={post} compact={tile} />}

      {confirmingDelete && (
        <DeletePostDialog post={post} onClose={() => setConfirmingDelete(false)} />
      )}
    </article>
  );
}

function PostHeader({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        className="hidden truncate text-[14px] text-ink-muted hover:underline sm:inline"
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
          <PostMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
}

/** Шапка плитки: автор очевиден из контекста, остаётся время и меню. */
function TileHeader({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <time
        dateTime={post.createdAt}
        title={absoluteTime(post.createdAt)}
        className="text-[13px] text-ink-muted"
      >
        {relativeTime(post.createdAt)}
      </time>
      {post.editedAt && (
        <span className="text-[12px] text-ink-faint" title={absoluteTime(post.editedAt)}>
          (изменён)
        </span>
      )}

      {post.isMine && (
        <div className="ml-auto">
          <PostMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
}

/**
 * Подвал по образцу Facebook: сначала сводка «что уже произошло»,
 * затем разделитель, затем действия. Разделение важно — иначе цифра
 * рядом с кнопкой читается как её часть, а не как состояние поста.
 */
function PostFooter({ post, compact = false }: { post: Post; compact?: boolean }) {
  const hasEngagement = post.likesCount > 0 || post.commentsCount > 0;

  // В плитке подписи «Нравится» и «Комментировать» не помещаются в колонку
  // ~300px, поэтому там иконка со счётчиком вместо кнопки с текстом.
  if (compact) {
    return (
      <div className="mt-3 flex items-center gap-1 border-t border-line px-2 py-1">
        <LikeButton post={post} compact />
        <Link
          href={`/post/${post.id}`}
          aria-label={`Комментарии: ${post.commentsCount}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-semibold text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <MessageCircle className="size-[17px]" />
          {post.commentsCount > 0 && <span className="tabular-nums">{post.commentsCount}</span>}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-2 sm:px-5">
      {hasEngagement && (
        <div className="flex items-center justify-between gap-3 py-2.5 text-[13px] text-ink-muted">
          {post.likesCount > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-like">
                <Heart className="size-2.5 fill-white text-white" />
              </span>
              {post.likesCount}
            </span>
          ) : (
            <span />
          )}

          {post.commentsCount > 0 && (
            <Link href={`/post/${post.id}`} className="hover:underline">
              {post.commentsCount} {plural(post.commentsCount, COMMENTS_FORMS)}
            </Link>
          )}
        </div>
      )}

      <div className={cn("flex gap-1 pt-1", hasEngagement ? "border-t border-line" : "")}>
        <LikeButton post={post} />

        <Link
          href={`/post/${post.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-[14px] font-semibold text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <MessageCircle className="size-[19px]" />
          Комментировать
        </Link>
      </div>
    </div>
  );
}

function LikeButton({ post, compact = false }: { post: Post; compact?: boolean }) {
  const user = useCurrentUser();
  const toggleLike = useToggleLike();
  const { toast } = useToast();

  // Анимация привязана к клику, а не к post.likedByMe: иначе «взрыв»
  // проигрывался бы у каждого лайкнутого поста при загрузке ленты.
  const [bursting, setBursting] = useState(false);

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
        if (!post.likedByMe) {
          setBursting(true);
          window.setTimeout(() => setBursting(false), 500);
        }
        toggleLike.mutate({ postId: post.id, liked: post.likedByMe });
      }}
      className={cn(
        "flex flex-1 items-center justify-center rounded-xl py-2 font-semibold transition-colors",
        compact ? "gap-1.5 text-[13px]" : "gap-2 text-[14px]",
        post.likedByMe
          ? "text-like hover:bg-like-soft"
          : "text-ink-muted hover:bg-like-soft hover:text-like",
      )}
    >
      <span className="relative flex items-center justify-center">
        {bursting && (
          <span
            aria-hidden="true"
            className="animate-like-ring absolute size-5 rounded-full border-2 border-like"
          />
        )}
        <Heart
          className={cn(
            compact ? "size-[17px]" : "size-[19px]",
            post.likedByMe && "fill-current",
            bursting && "animate-like-burst",
          )}
        />
      </span>
      {compact ? (
        post.likesCount > 0 && <span className="tabular-nums">{post.likesCount}</span>
      ) : (
        <>Нравится</>
      )}
    </button>
  );
}

function PostMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
              onDelete();
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
    <div className="mt-2 space-y-2 pb-4">
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

function DeletePostDialog({ post, onClose }: { post: Post; onClose: () => void }) {
  const deletePost = useDeletePost();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <ConfirmDialog
      title="Удалить пост"
      description="Пост исчезнет вместе со всеми лайками и комментариями. Отменить это будет нельзя."
      loading={deletePost.isPending}
      onCancel={onClose}
      onConfirm={() =>
        deletePost.mutate(post.id, {
          onSuccess: () => {
            toast("Пост удалён", "success");
            onClose();
            // Со страницы удалённого поста нужно уйти — иначе она тут же покажет 404.
            if (window.location.pathname === `/post/${post.id}`) router.push("/");
          },
          onError: (error) => {
            toast(error.message, "error");
            onClose();
          },
        })
      }
    />
  );
}
