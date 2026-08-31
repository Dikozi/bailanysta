"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { api, qs } from "@/lib/api";
import { NOTIFICATIONS_POLL_MS, PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/keys";
import { patchPostEverywhere } from "./usePosts";
import type {
  Comment,
  Notification,
  Page,
  SearchResults,
  TrendingHashtag,
  UserProfile,
  UserSummary,
} from "@/types";

/* ── Комментарии ─────────────────────────────────────────────── */

export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments(postId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.get<Page<Comment>>(`/posts/${postId}/comments${qs({ cursor: pageParam, limit: PAGE_SIZE })}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreateComment(postId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      api.post<{ comment: Comment; commentsCount: number }>(`/posts/${postId}/comments`, {
        content,
      }),
    onSuccess: ({ comment, commentsCount }) => {
      // Дописываем в конец последней страницы — комментарии идут по возрастанию.
      client.setQueryData<InfiniteData<Page<Comment>>>(queryKeys.comments(postId), (data) => {
        if (!data) return data;
        const pages = [...data.pages];
        const last = pages[pages.length - 1];
        pages[pages.length - 1] = { ...last, items: [...last.items, comment] };
        return { ...data, pages };
      });

      patchPostEverywhere(client, postId, (post) => ({ ...post, commentsCount }));
    },
  });
}

export function useDeleteComment(postId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete<{ commentsCount: number }>(`/comments/${commentId}`),
    onSuccess: ({ commentsCount }, commentId) => {
      client.setQueryData<InfiniteData<Page<Comment>>>(queryKeys.comments(postId), (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== commentId),
          })),
        };
      });

      patchPostEverywhere(client, postId, (post) => ({ ...post, commentsCount }));
    },
  });
}

/* ── Профили и подписки ──────────────────────────────────────── */

export function useProfile(username: string, initialData?: UserProfile) {
  return useQuery({
    queryKey: queryKeys.profile(username),
    queryFn: () => api.get<UserProfile>(`/users/${username}`),
    initialData,
  });
}

type FollowResult = { isFollowedByMe: boolean; followersCount: number };

/** Подписка тоже оптимистична: кнопка не должна «думать» полсекунды. */
export function useToggleFollow(username: string) {
  const client = useQueryClient();
  const key = queryKeys.profile(username);

  return useMutation({
    mutationFn: (isFollowed: boolean) =>
      isFollowed
        ? api.delete<FollowResult>(`/users/${username}/follow`)
        : api.post<FollowResult>(`/users/${username}/follow`),

    onMutate: async (isFollowed) => {
      await client.cancelQueries({ queryKey: key });
      const snapshot = client.getQueryData<UserProfile>(key);

      client.setQueryData<UserProfile>(key, (profile) =>
        profile
          ? {
              ...profile,
              isFollowedByMe: !isFollowed,
              followersCount: profile.followersCount + (isFollowed ? -1 : 1),
            }
          : profile,
      );

      return snapshot;
    },

    onError: (_error, _variables, snapshot) => {
      if (snapshot) client.setQueryData(key, snapshot);
    },

    onSuccess: (result) => {
      client.setQueryData<UserProfile>(key, (profile) =>
        profile ? { ...profile, ...result } : profile,
      );
      // Состав ленты «Подписки» изменился — её нужно перечитать.
      void client.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useFollowList(username: string, direction: "followers" | "following") {
  return useInfiniteQuery({
    queryKey:
      direction === "followers"
        ? queryKeys.followers(username)
        : queryKeys.following(username),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.get<Page<UserSummary>>(
        `/users/${username}/${direction}${qs({ cursor: pageParam, limit: PAGE_SIZE })}`,
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

/* ── Уведомления ─────────────────────────────────────────────── */

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.get<Page<Notification>>(`/notifications${qs({ cursor: pageParam, limit: PAGE_SIZE })}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

/**
 * Счётчик непрочитанных опрашивается по таймеру.
 *
 * WebSocket был бы точнее, но serverless-функции Vercel не держат постоянные
 * соединения, а тянуть ради этого внешний сервис — несоразмерная плата
 * за то, чтобы бейдж обновлялся не за 30 секунд, а за одну.
 */
export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.unread,
    queryFn: () => api.get<{ count: number }>("/notifications/unread"),
    enabled,
    refetchInterval: NOTIFICATIONS_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationsRead() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ success: true }>("/notifications/read"),
    onSuccess: () => {
      client.setQueryData(queryKeys.unread, { count: 0 });
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

/* ── Поиск ───────────────────────────────────────────────────── */

export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => api.get<SearchResults>(`/search${qs({ q: query })}`),
    enabled: query.trim().length > 0,
  });
}

export function useTrendingHashtags() {
  return useQuery({
    queryKey: queryKeys.trending,
    queryFn: () => api.get<TrendingHashtag[]>("/hashtags/trending"),
    staleTime: 5 * 60_000,
  });
}
