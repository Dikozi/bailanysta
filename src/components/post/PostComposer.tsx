"use client";

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

/**
 * Форма создания поста по образцу «стены» Facebook.
 *
 * В свёрнутом виде это одна строка-пилюля: она не давит на ленту и не просит
 * ничего, пока пользователь сам не захочет написать. По клику разворачивается
 * в полноценный редактор с AI-помощником и счётчиком символов.
 */
export function PostComposer() {
  const user = useCurrentUser();
  const [expanded, setExpanded] = useState(false);
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
  }, [content, expanded]);

  if (!user) return null;

  const trimmed = content.trim();
  const remaining = POST_MAX_LENGTH - trimmed.length;
  const canSubmit = trimmed.length > 0 && remaining >= 0 && !createPost.isPending;

  const open = () => {
    setExpanded(true);
    // Фокус после разворачивания: до появления поля фокусировать нечего.
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const collapse = () => {
    setExpanded(false);
    setAiOpen(false);
  };

  const submit = () => {
    if (!canSubmit) return;
    createPost.mutate(trimmed, {
      onSuccess: () => {
        setContent("");
        collapse();
        toast("Пост опубликован", "success");
      },
      onError: (error) => toast(error.message, "error"),
    });
  };

  if (!expanded) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-3 shadow-card sm:p-4">
        <div className="flex items-center gap-3">
          <Avatar displayName={user.displayName} avatarColor={user.avatarColor} />
          <button
            type="button"
            data-composer-input
            onClick={open}
            // truncate обязателен: длинное имя переносило текст на вторую
            // строку, и он вылезал за пределы пилюли фиксированной высоты.
            className="h-11 min-w-0 flex-1 truncate rounded-full bg-surface-muted px-4 text-left text-[15px] text-ink-faint transition-colors hover:bg-surface-hover"
          >
            Что происходит, {user.displayName.split(" ")[0]}?
          </button>
          <button
            type="button"
            onClick={() => {
              open();
              setAiOpen(true);
            }}
            aria-label="Открыть AI-помощник"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <Sparkles className="size-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Avatar displayName={user.displayName} avatarColor={user.avatarColor} />

        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            // Ctrl/Cmd+Enter — привычное сочетание для отправки в текстовом поле.
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit();
              if (event.key === "Escape" && trimmed.length === 0) collapse();
            }}
            placeholder="Что происходит?"
            aria-label="Текст нового поста"
            rows={3}
            className="min-h-[84px] border-0 bg-transparent px-0 text-[17px] focus:border-0"
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
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAiOpen((value) => !value)}
          aria-expanded={aiOpen}
          className={cn(aiOpen && "text-accent")}
        >
          <Sparkles className="size-4" />
          AI-помощник
        </Button>

        <CharacterCounter remaining={remaining} />

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={collapse} disabled={createPost.isPending}>
            Отмена
          </Button>
          <Button onClick={submit} loading={createPost.isPending} disabled={!canSubmit}>
            Опубликовать
          </Button>
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
