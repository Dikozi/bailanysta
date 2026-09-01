"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, qs } from "@/lib/api";
import { CONVERSATIONS_POLL_MS, MESSAGES_POLL_MS, PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/keys";
import type { Conversation, Message, Page } from "@/types";

/** Список бесед опрашивается по таймеру — тот же приём, что и уведомления. */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => api.get<Conversation[]>("/messages/conversations"),
    refetchInterval: CONVERSATIONS_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useUnreadMessagesCount(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.unreadMessages,
    queryFn: () => api.get<{ count: number }>("/messages/conversations/unread"),
    enabled,
    refetchInterval: CONVERSATIONS_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

/**
 * Открытая переписка опрашивается заметно чаще списка бесед — собеседник
 * ждёт ответа в реальном времени, и получасовая (или даже получасекундная
 * в масштабе уведомлений) задержка ощущалась бы как зависание чата.
 */
export function useConversation(username: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversation(username),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.get<Page<Message>>(`/messages/${username}${qs({ cursor: pageParam, limit: PAGE_SIZE })}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: MESSAGES_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useSendMessage(username: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => api.post<Message>(`/messages/${username}`, { content }),
    onSuccess: () => {
      // Проще перечитать беседу и список бесед, чем вручную вклеивать
      // сообщение в кэш инфинит-запроса на несколько страниц вглубь —
      // сообщений в одной беседе на порядки меньше, чем постов в ленте.
      void client.invalidateQueries({ queryKey: queryKeys.conversation(username) });
      void client.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useMarkConversationRead(username: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ success: true }>(`/messages/${username}/read`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.conversations });
      void client.invalidateQueries({ queryKey: queryKeys.unreadMessages });
    },
  });
}
