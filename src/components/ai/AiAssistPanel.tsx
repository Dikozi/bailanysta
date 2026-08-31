"use client";

import { useState } from "react";
import { Hash, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { useAiGenerate } from "@/hooks/useAi";
import { useToast } from "@/providers/ToastProvider";
import type { AiTone } from "@/lib/validation";

const TONES: Array<{ value: AiTone; label: string }> = [
  { value: "neutral", label: "Нейтрально" },
  { value: "friendly", label: "Дружелюбно" },
  { value: "professional", label: "Деловито" },
  { value: "witty", label: "С иронией" },
];

/**
 * Панель AI-ассистента.
 *
 * Все три режима ходят в наш собственный /api/v1/ai/generate — ключ Anthropic
 * живёт только на сервере. Результат подставляется в поле как обычный текст:
 * пользователь дописывает и правит его перед публикацией, а не публикует вслепую.
 */
export function AiAssistPanel({
  currentText,
  onApply,
  onClose,
}: {
  currentText: string;
  onApply: (text: string, mode: "replace" | "append") => void;
  onClose: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<AiTone>("neutral");
  const generate = useAiGenerate();
  const { toast } = useToast();

  const hasText = currentText.trim().length > 0;

  const run = (mode: "draft" | "improve" | "hashtags") => {
    generate.mutate(
      { mode, tone, topic: topic.trim() || undefined, text: currentText.trim() || undefined },
      {
        onSuccess: ({ text }) => {
          onApply(text, mode === "hashtags" ? "append" : "replace");
          onClose();
        },
        // Отдельная подсказка для «ключ не настроен»: иначе пользователь
        // будет думать, что фича сломана, а не выключена.
        onError: (error) => toast(error.message, "error"),
      },
    );
  };

  return (
    <div className="animate-pop-in mt-3 space-y-3 rounded-control border border-line bg-surface-muted p-3">
      <div className="flex items-center gap-2 text-[13px] font-bold uppercase text-ink-muted">
        <Sparkles className="size-3.5" />
        AI-помощник
      </div>

      {!hasText && (
        <Input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="О чём написать? Например: первый рабочий день"
          aria-label="Тема поста"
          maxLength={200}
        />
      )}

      <div className="flex flex-wrap gap-1.5">
        {TONES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTone(item.value)}
            aria-pressed={tone === item.value}
            className={cn(
              "rounded-full border px-3 py-1 text-[13px] font-medium transition-colors",
              tone === item.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-line-strong text-ink-muted hover:bg-surface-hover hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {hasText ? (
          <>
            <Button
              size="sm"
              loading={generate.isPending && generate.variables?.mode === "improve"}
              disabled={generate.isPending}
              onClick={() => run("improve")}
            >
              <Wand2 className="size-4" />
              Улучшить текст
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={generate.isPending && generate.variables?.mode === "hashtags"}
              disabled={generate.isPending}
              onClick={() => run("hashtags")}
            >
              <Hash className="size-4" />
              Подобрать хэштеги
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            loading={generate.isPending}
            disabled={generate.isPending || topic.trim().length === 0}
            onClick={() => run("draft")}
          >
            <Sparkles className="size-4" />
            Написать черновик
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={onClose} disabled={generate.isPending}>
          Закрыть
        </Button>
      </div>

      <p className="text-[12px] leading-snug text-ink-faint">
        Текст сгенерирован моделью и может содержать неточности — проверьте перед публикацией.
      </p>
    </div>
  );
}
