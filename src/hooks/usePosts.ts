"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { api, qs } from "@/lib/api";
import { queryKeys, type FeedParams } from "@/lib/keys";
import { PAGE_SIZE } from "@/lib/constants";
import type { Page, Post } from "@/types";

type Feed = InfiniteData<Page<Post>>;

/**
 * Точечно правит один пост во всех кэшах сразу — в любой ленте, где он есть,
 * и на его собственной странице.
 *
 * Без этого лайк, поставленный в ленте, не виден на странице поста и наоборот:
 * пользователь считает, что действие не сработало, и жмёт ещё раз.
 */
function patchPostEverywhere(
  client: QueryClient,
  postId: string,
  patch: (post: Post) => Post,
): void {
  client.setQueriesData<Feed>({ queryKey: ["feed"] }, (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((post) => (post.id === postId ? patch(post) : post)),
      })),
    };
  });

  client.setQueryData<Post>(queryKeys.post(postId), (post) =>
    post ? patch(post) : post,
  );
}

function removePostEverywhere(client: QueryClient, postId: string): void {
  client.setQueriesData<Feed>({ queryKey: ["feed"] }, (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.filter((post) => post.id !== postId),
      })),
    };
  });
}

/**
 * Бесконечная лента: следующая страница берётся по курсору из предыдущей.
 *
 * initialPage — первая страница, отрисованная на сервере. С ней лента видна
 * сразу в первом HTML, без промежуточного экрана скелетонов.
 */
export function useFeed(params: FeedParams, initialPage?: Page<Post>) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.get<Page<Post>>(`/posts${qs({ ...params, cursor: pageParam, limit: PAGE_SIZE })}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [undefined] }
      : undefined,
  });
}

export function usePost(postId: string, initialData?: Post) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => api.get<Post>(`/posts/${postId}`),
    initialData,
  });
}

export function useCreatePost() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => api.post<Post>("/posts", { content }),
    onSuccess: (post) => {
      // Новый пост должен появиться и в ленте, и в профиле автора,
      // поэтому перезапрашиваем все ленты, а не правим их вручную.
      void client.invalidateQueries({ queryKey: ["feed"] });
      void client.invalidateQueries({ queryKey: queryKeys.profile(post.author.username) });
      void client.invalidateQueries({ queryKey: queryKeys.trending });
    },
  });
}

export function useUpdatePost() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.patch<Post>(`/posts/${postId}`, { content }),
    onSuccess: (updated) => {
      patchPostEverywhere(client, updated.id, () => updated);
      void client.invalidateQueries({ queryKey: queryKeys.trending });
    },
  });
}

export function useDeletePost() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.delete<{ success: true }>(`/posts/${postId}`),
    onSuccess: (_result, postId) => {
      removePostEverywhere(client, postId);
      void client.invalidateQueries({ queryKey: ["profile"] });
      void client.invalidateQueries({ queryKey: queryKeys.trending });
    },
  });
}

type LikeResult = { likesCount: number; likedByMe: boolean };

/**
 * Оптимистичный лайк: сердечко реагирует мгновенно, запрос уходит фоном.
 *
 * Ждать ответ сервера — это 100–300 мс задержки на действие, которое
 * пользователь совершает десятками за сессию. При ошибке состояние
 * откатывается ровно к тому, что было до клика.
 */
export function useToggleLike() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked
        ? api.delete<LikeResult>(`/posts/${postId}/like`)
        : api.post<LikeResult>(`/posts/${postId}/like`),

    onMutate: async ({ postId, liked }) => {
      // Иначе ответ уже летящего запроса перезапишет наше предсказание.
      await client.cancelQueries({ queryKey: ["feed"] });
      await client.cancelQueries({ queryKey: queryKeys.post(postId) });

      const snapshot = {
        feeds: client.getQueriesData<Feed>({ queryKey: ["feed"] }),
        post: client.getQueryData<Post>(queryKeys.post(postId)),
      };

      patchPostEverywhere(client, postId, (post) => ({
        ...post,
        likedByMe: !liked,
        likesCount: post.likesCount + (liked ? -1 : 1),
      }));

      return snapshot;
    },

    onError: (_error, { postId }, snapshot) => {
      if (!snapshot) return;
      for (const [key, data] of snapshot.feeds) client.setQueryData(key, data);
      client.setQueryData(queryKeys.post(postId), snapshot.post);
    },

    // Сервер — источник истины: подтягиваем настоящий счётчик,
    // если параллельно лайкал кто-то ещё.
    onSuccess: (result, { postId }) => {
      patchPostEverywhere(client, postId, (post) => ({
        ...post,
        likedByMe: result.likedByMe,
        likesCount: result.likesCount,
      }));
    },
  });
}

export { patchPostEverywhere };
