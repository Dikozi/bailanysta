"use client";

import { useState } from "react";
import { Compass, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PostList } from "@/components/post/PostList";
import { cn } from "@/lib/cn";
import { useFeed } from "@/hooks/usePosts";
import { useCurrentUser } from "@/providers/SessionProvider";
import type { Page, Post } from "@/types";

type Tab = "global" | "friends";

/**
 * Две ленты в одном экране. Вкладка «Друзья» показывается только тем,
 * кто вошёл: гостю она была бы всегда пустой и выглядела бы поломкой.
 */
export function FeedTabs({ initialPage }: { initialPage: Page<Post> }) {
  const user = useCurrentUser();
  const [tab, setTab] = useState<Tab>("global");

  const globalFeed = useFeed({ feed: "global" }, initialPage);
  const friendsFeed = useFeed({ feed: "friends" });

  return (
    <>
      {user && (
        <div
          role="tablist"
          className="sticky top-[57px] z-10 mb-3 flex overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-card backdrop-blur lg:top-3"
        >
          <TabButton active={tab === "global"} onClick={() => setTab("global")}>
            Все посты
          </TabButton>
          <TabButton active={tab === "friends"} onClick={() => setTab("friends")}>
            Друзья
          </TabButton>
        </div>
      )}

      {tab === "global" ? (
        <PostList
          query={globalFeed}
          emptyState={
            <EmptyState
              icon={Compass}
              title="Пока пусто"
              description="Ещё никто ничего не написал. Будьте первым — напишите пост выше."
            />
          }
        />
      ) : (
        <PostList
          query={friendsFeed}
          emptyState={
            <EmptyState
              icon={Users}
              title="Здесь появятся посты ваших друзей"
              description="Найдите людей через поиск, отправьте заявку в друзья — их посты соберутся в этой ленте."
            />
          }
        />
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex-1 py-3.5 text-[15px] transition-colors",
        active ? "font-bold text-ink" : "font-medium text-ink-muted hover:bg-surface-hover",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-14 rounded-full bg-accent" />
      )}
    </button>
  );
}
