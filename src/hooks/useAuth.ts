"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/providers/SessionProvider";
import type { CurrentUser } from "@/types";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "@/lib/validation";

/**
 * redirectTo — куда вернуть после входа. Middleware кладёт исходный путь
 * в ?next=, чтобы человек, которого развернули с /settings, попал обратно
 * туда же, а не на главную.
 */
export function useLogin(redirectTo = "/") {
  const { setUser } = useSession();
  const router = useRouter();
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => api.post<CurrentUser>("/auth/login", input),
    onSuccess: (user) => {
      setUser(user);
      // Полностью сбрасываем кэш: под другим пользователем «лайкнуто мной»
      // и лента подписок означают уже совсем другое.
      client.clear();
      router.push(redirectTo);
      router.refresh();
    },
  });
}

export function useRegister() {
  const { setUser } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<CurrentUser>("/auth/register", input),
    onSuccess: (user) => {
      setUser(user);
      router.push("/");
      router.refresh();
    },
  });
}

export function useLogout() {
  const { setUser } = useSession();
  const router = useRouter();
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ success: true }>("/auth/logout"),
    onSuccess: () => {
      setUser(null);
      client.clear();
      router.push("/");
      router.refresh();
    },
  });
}

export function useUpdateProfile() {
  const { setUser } = useSession();
  const client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<CurrentUser>("/users/me", input),
    onSuccess: (user) => {
      setUser(user);
      void client.invalidateQueries({ queryKey: ["profile"] });
      void client.invalidateQueries({ queryKey: ["feed"] });
      router.refresh();
    },
  });
}
