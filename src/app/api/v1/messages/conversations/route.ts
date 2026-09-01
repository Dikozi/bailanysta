import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { listConversations } from "@/server/services/messages";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await listConversations(user.id));
});
