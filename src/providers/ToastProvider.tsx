"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; text: string };

type ToastContextValue = {
  toast: (text: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ICON_COLORS: Record<ToastKind, string> = {
  success: "text-accent",
  error: "text-danger",
  info: "text-ink-muted",
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (text: string, kind: ToastKind = "info") => {
      const id = nextId++;
      setToasts((current) => [...current, { id, kind, text }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* aria-live, чтобы скринридер тоже узнал об ошибке, а не только глаз. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <div
              key={item.id}
              className="animate-pop-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-pop"
            >
              <Icon className={`mt-0.5 size-4 shrink-0 ${ICON_COLORS[item.kind]}`} />
              <p className="flex-1 text-sm leading-snug">{item.text}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Закрыть уведомление"
                className="-m-1 rounded p-1 text-ink-faint transition hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast используется вне ToastProvider");
  return context;
}
