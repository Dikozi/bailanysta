"use client";

import Link from "next/link";
import { Hash, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTrendingHashtags } from "@/hooks/useSocial";
import { withPlural, POSTS_FORMS } from "@/lib/format";

/** Правая колонка: популярные темы. Дешёвый способ дать ленте контекст. */
export function TrendingRail() {
  const { data, isLoading } = useTrendingHashtags();

  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 px-1 text-[13px] font-bold uppercase text-ink-muted">
        <TrendingUp className="size-3.5" />
        Популярные темы
      </h2>

      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="px-1 py-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <p className="px-1 py-2 text-sm text-ink-muted">Пока ни одной темы — напишите первый пост с хэштегом.</p>
      )}

      <ul>
        {data?.map((item) => (
          <li key={item.tag}>
            <Link
              href={`/tag/${encodeURIComponent(item.tag)}`}
              className="flex items-baseline gap-1.5 rounded-control px-1 py-2 transition-colors hover:bg-surface-hover"
            >
              <Hash className="size-3.5 shrink-0 translate-y-0.5 text-ink-faint" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{item.tag}</span>
                <span className="block text-[13px] text-ink-muted">
                  {withPlural(item.postsCount, POSTS_FORMS)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
