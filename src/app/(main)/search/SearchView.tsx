"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Hash, Search as SearchIcon, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PostCard } from "@/components/post/PostCard";
import { PostListSkeleton } from "@/components/post/PostList";
import { plural, POSTS_FORMS } from "@/lib/format";
import { useDebounced } from "@/hooks/useDebounced";
import { useSearch, useTrendingHashtags } from "@/hooks/useSocial";

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  const [input, setInput] = useState(initial);
  // Запрос уходит не на каждое нажатие, а через паузу после набора.
  const query = useDebounced(input.trim(), 350);
  const { data, isFetching } = useSearch(query);

  // Держим строку поиска в URL: результат можно переслать или открыть из истории.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (query === current) return;
    router.replace(query ? `/search?q=${encodeURIComponent(query)}` : "/search", { scroll: false });
  }, [query, params, router]);

  const nothingFound =
    data && data.posts.length === 0 && data.users.length === 0 && data.hashtags.length === 0;

  return (
    <>
      <div className="sticky top-[57px] z-10 border-b border-line bg-ground/90 px-4 py-3 backdrop-blur lg:top-0">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Посты, люди, хэштеги"
            aria-label="Поиск"
            autoFocus
            className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-10 text-[15px] placeholder:text-ink-faint focus:border-accent focus-visible:outline-none"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              aria-label="Очистить"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-faint transition-colors hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {!query && <TrendingSuggestions />}

      {query && isFetching && !data && <PostListSkeleton count={4} />}

      {query && nothingFound && !isFetching && (
        <EmptyState
          icon={SearchIcon}
          title={`По запросу «${query}» ничего не найдено`}
          description="Попробуйте другое слово или его часть — поиск понимает и неполные совпадения."
        />
      )}

      {data && (
        <>
          {data.users.length > 0 && (
            <Section title="Люди">
              {data.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3.5 transition-colors hover:bg-surface-hover sm:px-5"
                >
                  <Avatar displayName={user.displayName} avatarColor={user.avatarColor} />
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{user.displayName}</span>
                    <span className="block truncate text-[14px] text-ink-muted">
                      @{user.username}
                    </span>
                  </span>
                </Link>
              ))}
            </Section>
          )}

          {data.hashtags.length > 0 && (
            <Section title="Темы">
              <div className="flex flex-wrap gap-2 border-b border-line bg-surface px-4 py-4 sm:px-5">
                {data.hashtags.map((item) => (
                  <Link
                    key={item.tag}
                    href={`/tag/${encodeURIComponent(item.tag)}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line-strong px-3 py-1.5 text-[14px] transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                  >
                    <Hash className="size-3.5" />
                    {item.tag}
                    <span className="text-ink-faint">{item.postsCount}</span>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {data.posts.length > 0 && (
            <Section title={`Посты · ${data.posts.length} ${plural(data.posts.length, POSTS_FORMS)}`}>
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Section>
          )}
        </>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-line bg-ground px-4 py-2.5 text-[13px] font-bold uppercase text-ink-muted sm:px-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Пока запрос не введён, показываем популярные темы как точку входа. */
function TrendingSuggestions() {
  const { data } = useTrendingHashtags();

  return (
    <div className="px-4 py-6 sm:px-5">
      <h2 className="mb-3 text-[13px] font-bold uppercase text-ink-muted">Популярные темы</h2>
      <div className="flex flex-wrap gap-2">
        {data?.map((item) => (
          <Link
            key={item.tag}
            href={`/tag/${encodeURIComponent(item.tag)}`}
            className="inline-flex items-center gap-1 rounded-full border border-line-strong px-3.5 py-2 text-[14px] transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            <Hash className="size-3.5" />
            {item.tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
