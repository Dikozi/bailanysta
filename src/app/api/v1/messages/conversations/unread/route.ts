import { getSessionUserId } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { countUnreadMessages } from "@/server/services/messages";

/** Дёргается по таймеру для бейджа в навигации — гостю просто ноль. */
export const GET = route(async () => {
  const userId = await getSessionUserId();
  if (!userId) return ok({ count: 0 });
  return ok({ count: await countUnreadMessages(userId) });
});
