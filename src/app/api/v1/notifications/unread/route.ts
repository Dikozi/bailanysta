import { getSessionUserId } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { countUnreadNotifications } from "@/server/services/notifications";

/** Дёргается по таймеру, поэтому для гостя просто ноль, без 401 и шума в консоли. */
export const GET = route(async () => {
  const userId = await getSessionUserId();
  if (!userId) return ok({ count: 0 });
  return ok({ count: await countUnreadNotifications(userId) });
});
