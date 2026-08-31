"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiAssistPanel } from "@/components/ai/AiAssistPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { POST_MAX_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useCreatePost } from "@/hooks/usePosts";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";

export function PostComposer() {
  const user = useCurrentUser();
  const [content, setContent] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createPost = useCreatePost();
  const { toast } = useToast();

  // Поле растёт под текст, но не бесконечно: после ~10 строк включается
  // собственная прокрутка, иначе кнопка «Опубликовать» уезжает за экран.
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 260)}px`;
  }, [content]);

  if (!user) return <GuestPrompt />;

  const trimmed = content.trim();
  const remaining = POST_MAX_LENGTH - trimmed.length;
  const canSubmit = trimmed.length > 0 && remaining >= 0 && !createPost.isPending;

  const submit = () => {
    if (!canSubmit) return;
    createPost.mutate(trimmed, {
      onSuccess: () => {
        setContent("");
        setAiOpen(false);
        toast("Пост опубликован", "success");
      },
      onError: (error) => toast(error.message, "error"),
    });
  };

  return (
    <div className="border-b border-line bg-surface px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <Avatar displayName={user.displayName} avatarColor={user.avatarColor} />

        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            data-composer-input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            // Ctrl/Cmd+Enter — привычное сочетание для отправки в текстовом поле.
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit();
            }}
            placeholder="Что происходит?"
            aria-label="Текст нового поста"
            rows={2}
            className="min-h-[60px] border-0 bg-transparent px-0 text-[17px] focus:border-0"
          />

          {aiOpen && (
            <AiAssistPanel
              currentText={content}
              onClose={() => setAiOpen(false)}
              onApply={(text, mode) =>
                setContent((current) =>
                  mode === "append" ? `${current.trimEnd()}\n\n${text}` : text,
                )
              }
            />
          )}

          <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAiOpen((open) => !open)}
              aria-expanded={aiOpen}
              className={cn(aiOpen && "text-accent")}
            >
              <Sparkles className="size-4" />
              AI-помощник
            </Button>

            <CharacterCounter remaining={remaining} />

            <Button className="ml-auto" onClick={submit} loading={createPost.isPending} disabled={!canSubmit}>
              Опубликовать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Счётчик появляется только на подходе к лимиту: постоянно висящее число
 * отвлекает, когда до предела ещё далеко.
 */
function CharacterCounter({ remaining }: { remaining: number }) {
  if (remaining > 80) return null;

  return (
    <span
      className={cn(
        "text-[13px] font-semibold tabular-nums",
        remaining < 0 ? "text-danger" : remaining <= 20 ? "text-like" : "text-ink-muted",
      )}
    >
      {remaining}
    </span>
  );
}

function GuestPrompt() {
  return (
    <div className="border-b border-line bg-surface px-5 py-6 text-center">
      <p className="font-display text-lg">Присоединяйтесь к разговору</p>
      <p className="mt-1 text-sm text-ink-muted">
        Войдите, чтобы писать посты, ставить лайки и комментировать.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Link
          href="/login"
          className="flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          Войти
        </Link>
        <Link
          href="/register"
          className="flex h-10 items-center rounded-full border border-line-strong px-5 text-sm font-semibold transition-colors hover:bg-surface-hover"
        >
          Создать аккаунт
        </Link>
      </div>
    </div>
  );
}
