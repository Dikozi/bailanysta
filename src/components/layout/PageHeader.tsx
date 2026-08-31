"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Шапка внутреннего экрана с кнопкой «назад» — так же, как в мобильных приложениях. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-ground/90 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Назад"
        className="-m-2 rounded-full p-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <ArrowLeft className="size-5" />
      </button>
      <div className="min-w-0">
        <h1 className="truncate font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
