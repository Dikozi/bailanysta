import { cookies } from "next/headers";
import { COOKIE_SESSION } from "@/lib/constants";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { CurrentUser } from "@/types";
import { SESSION_MAX_AGE_SECONDS, signSession, verifySession } from "./jwt";

/**
 * Токен лежит в httpOnly-куке, а не в localStorage: так его не достанет
 * посторонний скрипт на странице, и он сам уезжает с каждым запросом на сервер.
 */

export async function setSessionCookie(userId: string, username: string): Promise<void> {
  const token = await signSession({ userId, username });
  const store = await cookies();

  store.set(COOKIE_SESSION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SESSION);
}

/** Только идентификатор из токена — без похода в базу. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_SESSION)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  return payload?.userId ?? null;
}

/**
 * Полный профиль текущего пользователя.
 * Возвращает null и для гостя, и для «токен валиден, но пользователь удалён».
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarColor: true,
      bio: true,
    },
  });

  return user;
}

/** Для эндпоинтов, где аноним недопустим. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw errors.unauthorized();
  return user;
}
