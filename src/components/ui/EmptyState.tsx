import type { LucideIcon } from "lucide-react";

/**
 * Пустое состояние всегда объясняет, почему пусто, и что сделать дальше.
 * Голая надпись «Ничего нет» неотличима от сломанной загрузки.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        <Icon className="size-5" />
      </span>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
