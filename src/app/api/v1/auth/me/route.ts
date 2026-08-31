import { getCurrentUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";

/** Гость — это не ошибка, поэтому 200 и null, а не 401. */
export const GET = route(async () => {
  return ok(await getCurrentUser());
});
