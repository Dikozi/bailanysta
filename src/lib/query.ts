/** Достаёт query-параметры запроса в объект — под разбор zod-схемой. */
export function searchParamsOf(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams);
}
