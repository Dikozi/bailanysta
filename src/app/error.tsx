"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Экран непредвиденной ошибки. Текст самой ошибки пользователю не показываем —
 * он всё равно ничего не скажет, а в проде может выдать внутренние детали.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Ошибка рендера:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-6" />
      </span>
      <h1 className="font-display text-2xl">Что-то пошло не так</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Страницу не удалось отобразить. Попробуйте ещё раз — если повторится,
        обновите страницу целиком.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[12px] text-ink-faint">код: {error.digest}</p>
      )}
      <Button className="mt-6" size="lg" onClick={reset}>
        Попробовать снова
      </Button>
    </div>
  );
}
