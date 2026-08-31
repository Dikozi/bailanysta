import { AI_RATE_LIMIT, AI_RATE_WINDOW_MS } from "@/lib/constants";
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
