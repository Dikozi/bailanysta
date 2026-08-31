import type { FeedQuery } from "./validation";

/**
 * Ключи кэша собраны в одном месте: иначе инвалидация после мутации
 * промахивается мимо запроса, и лента не обновляется без перезагрузки.
 */
export type FeedParams = Partial<Pick<FeedQuery, "feed" | "authorId" | "tag" | "q">>;

export const queryKeys = {
  feed: (params: FeedParams) => ["feed", params] as const,
  post: (id: string) => ["post", id] as const,
  comments: (postId: string) => ["comments", postId] as const,
  profile: (username: string) => ["profile", username] as const,
  followers: (username: string) => ["followers", username] as const,
  following: (username: string) => ["following", username] as const,
  notifications: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  search: (q: string) => ["search", q] as const,
  trending: ["hashtags", "trending"] as const,
};
