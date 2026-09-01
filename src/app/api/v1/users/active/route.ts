import { ok, route } from "@/server/http";
import { getActiveAuthors } from "@/server/services/users";

/** Авторы для ряда с кольцами наверху ленты. Доступно и гостю. */
export const GET = route(async () => {
  return ok(await getActiveAuthors());
});
