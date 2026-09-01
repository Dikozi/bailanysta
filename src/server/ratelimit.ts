import {
  AI_RATE_LIMIT,
  AI_RATE_WINDOW_MS,
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_ATTEMPT_WINDOW_MS,
} from "@/lib/constants";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";

/**
 * Лимит считаем по строкам в БД, а не в памяти процесса.
 *
 * На Vercel каждый запрос может попасть в свой инстанс функции, и счётчик
 * в переменной модуля обнулялся бы непредсказуемо. Redis ради одной фичи —
 * лишняя инфраструктура, а COUNT по индексу (userId, createdAt) стоит копейки.
 */
export async function enforceAiRateLimit(userId: string): Promise<void> {
  const since = new Date(Date.now() - AI_RATE_WINDOW_MS);
  const used = await prisma.aiUsage.count({
    where: { userId, createdAt: { gte: since } },
  });

  if (used >= AI_RATE_LIMIT) {
    throw errors.rateLimited(
      `Лимит AI-генераций исчерпан: ${AI_RATE_LIMIT} запросов в час. Попробуйте позже.`,
    );
  }
}

export async function recordAiUsage(userId: string, mode: string): Promise<void> {
  await prisma.aiUsage.create({ data: { userId, mode } });
}

/**
 * Защита входа от перебора пароля.
 *
 * Считается по email, а не по паре email+IP: IP за serverless-прокси Vercel
 * добывать надёжно сложнее, чем стоит для проекта такого масштаба, а лимит
 * по одному email уже делает автоматический перебор пароля бессмысленным
 * по скорости — атакующему нужно перебирать миллионы паролей, а не восемь.
 *
 * Считаем и попытки на несуществующую почту: иначе перебор годных email
 * для последующей атаки на пароль остался бы вообще без ограничения.
 */
export async function enforceLoginRateLimit(email: string): Promise<void> {
  const since = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MS);
  const attempts = await prisma.loginAttempt.count({
    where: { email, createdAt: { gte: since } },
  });

  if (attempts >= LOGIN_ATTEMPT_LIMIT) {
    throw errors.rateLimited(
      "Слишком много попыток входа. Подождите 15 минут и попробуйте снова.",
    );
  }
}

export async function recordFailedLogin(email: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { email } });
}
