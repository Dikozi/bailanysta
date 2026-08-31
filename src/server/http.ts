import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiError } from "@/types";

/**
 * Единый конверт ответа: успех — { data }, ошибка — { error: { code, message, fields? } }.
 * Клиенту не нужно гадать, что пришло, а стектрейсы наружу не утекают.
 */

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errors = {
  badRequest: (message = "Некорректный запрос", fields?: Record<string, string>) =>
    new AppError(400, "BAD_REQUEST", message, fields),
  unauthorized: (message = "Нужно войти в аккаунт") =>
    new AppError(401, "UNAUTHORIZED", message),
  forbidden: (message = "Недостаточно прав") => new AppError(403, "FORBIDDEN", message),
  notFound: (message = "Не найдено") => new AppError(404, "NOT_FOUND", message),
  conflict: (message: string, fields?: Record<string, string>) =>
    new AppError(409, "CONFLICT", message, fields),
  validation: (fields: Record<string, string>) =>
    new AppError(422, "VALIDATION_ERROR", "Проверьте заполнение полей", fields),
  rateLimited: (message: string) => new AppError(429, "RATE_LIMITED", message),
  aiNotConfigured: () =>
    new AppError(
      503,
      "AI_NOT_CONFIGURED",
      "AI-ассистент не настроен: на сервере не задан ANTHROPIC_API_KEY",
    ),
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Собирает первую ошибку по каждому полю — под подписи в форме. */
function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    const body: ApiError = { code: error.code, message: error.message };
    if (error.fields) body.fields = error.fields;
    return NextResponse.json({ error: body }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const body: ApiError = {
      code: "VALIDATION_ERROR",
      message: "Проверьте заполнение полей",
      fields: zodFields(error),
    };
    return NextResponse.json({ error: body }, { status: 422 });
  }

  // Неожиданное — в лог сервера целиком, наружу только общий текст.
  console.error("[api] Необработанная ошибка:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Внутренняя ошибка сервера" } satisfies ApiError },
    { status: 500 },
  );
}

/**
 * Обёртка для route handler: убирает try/catch из каждого эндпоинта.
 * Сигнатура совпадает с той, что ожидает Next, включая асинхронный params.
 */
export function route<Ctx = unknown>(
  handler: (request: Request, context: Ctx) => Promise<Response>,
) {
  return async (request: Request, context: Ctx): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return fail(error);
    }
  };
}
