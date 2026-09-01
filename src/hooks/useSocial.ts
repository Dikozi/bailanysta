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

/* ── Профили и дружба ─────────────────────────────────────────── */

export function useProfile(username: string, initialData?: UserProfile) {
  return useQuery({
    queryKey: queryKeys.profile(username),
    queryFn: () => api.get<UserProfile>(`/users/${username}`),
    initialData,
  });
}

type FriendActionResult = { friendStatus: UserProfile["friendStatus"]; friendsCount: number };

function patchProfile(client: ReturnType<typeof useQueryClient>, username: string, patch: Partial<UserProfile>) {
  client.setQueryData<UserProfile>(queryKeys.profile(username), (profile) =>
    profile ? { ...profile, ...patch } : profile,
  );
}

/**
 * Одна мутация на все переходы кнопки профиля: «Добавить в друзья»,
 * «Отменить заявку», «Удалить из друзей» — все три бьют по одному и тому же
 * REST-ресурсу (POST создаёт связь, DELETE убирает её), различие только
 * в оптимистичном состоянии, которое мы предсказываем на клиенте.
 */
export function useSendFriendRequest(username: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<FriendActionResult>(`/users/${username}/friend-request`),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: queryKeys.profile(username) });
      const snapshot = client.getQueryData<UserProfile>(queryKeys.profile(username));
      patchProfile(client, username, { friendStatus: "outgoing" });
      return snapshot;
    },
    onError: (_error, _variables, snapshot) => {
      if (snapshot) client.setQueryData(queryKeys.profile(username), snapshot);
    },
    onSuccess: (result) => patchProfile(client, username, result),
  });
}

export function useRemoveFriendConnection(username: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete<FriendActionResult>(`/users/${username}/friend-request`),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: queryKeys.profile(username) });
      const snapshot = client.getQueryData<UserProfile>(queryKeys.profile(username));
      patchProfile(client, username, { friendStatus: "none" });
      return snapshot;
    },
    onError: (_error, _variables, snapshot) => {
      if (snapshot) client.setQueryData(queryKeys.profile(username), snapshot);
    },
    onSuccess: (result) => {
      patchProfile(client, username, result);
      // Состав ленты «Друзья» изменился — её нужно перечитать.
      void client.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/**
 * Принять/отклонить заявку — действуют не только с профиля, но и прямо
 * из уведомления, поэтому не привязаны к queryKeys.profile конкретного
 * компонента: инвалидируют профиль явно переданным username.
 */
export function useAcceptFriendRequest() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      api.post<FriendActionResult>(`/users/${username}/friend-request/accept`),
    onSuccess: (result, username) => {
      patchProfile(client, username, result);
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
      void client.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeclineFriendRequest() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      api.post<FriendActionResult>(`/users/${username}/friend-request/decline`),
    onSuccess: (result, username) => {
      patchProfile(client, username, result);
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useFriendsList(username: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.friends(username),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.get<Page<UserSummary>>(`/users/${username}/friends${qs({ cursor: pageParam, limit: PAGE_SIZE })}`),
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
