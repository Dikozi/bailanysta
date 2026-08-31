import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { markNotificationsRead } from "@/server/services/notifications";

export const POST = route(async () => {
  const user = await requireUser();
  await markNotificationsRead(user.id);
  return ok({ success: true });
});
